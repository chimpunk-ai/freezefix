// On-device voice notes. The whole point of this file is the sentence on the
// privacy page: audio is recorded on the phone, turned into text on the phone,
// and thrown away. Nothing in here makes a network request with audio or text.
//
// How: Whisper, the small multilingual one, running in the browser through
// @huggingface/transformers (ONNX Runtime Web, WASM backend, 8-bit weights).
// The library and the model files are static downloads — about 40 MB the first
// time, then held in the browser's Cache Storage by the library — fetched from
// jsDelivr and the Hugging Face hub the way any script or font is fetched. They
// see the device's IP address like any CDN does; they never see audio or text.
//
// Why a runtime import and not a package: the model has to be loaded lazily
// anyway (nobody should pay 40 MB to open the log), and keeping it out of the
// bundle keeps the app shell small. The import goes through `new Function` so
// neither Turbopack nor any other bundler tries to resolve the URL at build.
//
// Why base, why WASM: base-q8 still transcribes a chunk of 30 seconds in a
// handful of seconds on a mid-range phone, well inside the LogScreen's
// 60-second recording cap (at most 2 chunks). WASM works everywhere
// MediaRecorder does; WebGPU would be faster on some devices but adds a path
// that differs per browser.
//
// Bumped from whisper-tiny to whisper-base on 19 Nov 2026 after users
// reported real transcripts dropping words — tiny is the least accurate
// Whisper size, and this was the documented next step. Also added a stride
// between chunks: with chunk_length_s alone, a word spoken right at a 30s
// boundary can land half in one chunk and half in the next and get dropped
// entirely; the overlap gives the model enough context on both sides of the
// seam to transcribe it once instead of losing it.
//
// Stride widened from 5s to 10s on 27 Nov 2026 (task 39 of the 50-step
// plan) after the 19 Nov fix didn't fully resolve it -- transcripts were
// still reported dropping words or whole phrases. More overlap per
// boundary is the one further knob here that's low-risk (a 60s recording
// is still only two chunks, so the extra compute is small) and can't make
// things worse the way changing the model or quantization could. INFERRED,
// NOT VERIFIED: this environment has no microphone and no way to run the
// model against real audio, so this is reasoned from how Whisper's chunk
// stitching works, not measured. If real transcripts still drop whole
// phrases (not just at a chunk seam) after this, the cause is probably
// something else -- the model silently giving up on a quiet or unclear
// segment, not a boundary effect -- and widening the stride further won't
// help with that.

const LIB_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const MODEL_ID = "onnx-community/whisper-base";
export const MODEL_SIZE_LABEL = "about 80 MB";
const TARGET_RATE = 16000;
const MIN_SECONDS = 0.6;

export type VoiceErrorKind =
  | "unsupported"
  | "permission-denied"
  | "model-download-failed"
  | "too-short"
  | "decode-failed"
  | "cancelled";

export class VoiceError extends Error {
  kind: VoiceErrorKind;
  constructor(kind: VoiceErrorKind, message?: string) {
    super(message ?? kind);
    this.kind = kind;
  }
}

export type Progress = { percent: number; file?: string };
export type Transcript = { text: string; language?: string };

type AsrOutput = { text?: string; language?: string; chunks?: Array<{ text?: string; language?: string }> };
type AsrPipeline = (audio: Float32Array, opts: Record<string, unknown>) => Promise<AsrOutput>;

// Bundler-proof dynamic import of a URL.
//
// Built lazily (inside this function, not at module scope) on purpose: the
// `new Function(...)` constructor call itself needs 'unsafe-eval' in the
// page's CSP, same as eval() — it doesn't matter that the string it builds
// is just "return import(u)". When this was built at module load time, any
// page whose bundle pulled in this file (even one that never records a
// voice note) threw that EvalError the instant the module evaluated,
// because our CSP's script-src only allows 'wasm-unsafe-eval', not
// 'unsafe-eval'. That's what took getfreezefix.com's landing page down on
// 19 Nov 2026: the crash had nothing to do with WeekInsights (see the
// commented-out import below, which stays removed pending its own
// diagnosis, but was never the real cause here). Deferring this call means
// a page that never touches voice notes never builds it and never trips
// the CSP check. Recording a voice note still needs 'unsafe-eval' — see
// the script-src comment in next.config.ts, updated alongside this.
function buildImportUrl(): (u: string) => Promise<Record<string, unknown>> {
  return new Function("u", "return import(u)") as (u: string) => Promise<Record<string, unknown>>;
}

let pipePromise: Promise<AsrPipeline> | null = null;
let cancelled = false;

/** True when this browser can record and run the model. No network check. */
export function isSupported(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const hasMic = Boolean(navigator.mediaDevices?.getUserMedia);
  const hasRecorder = typeof MediaRecorder !== "undefined";
  const hasAudio = typeof AudioContext !== "undefined" || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext !== "undefined";
  const hasWasm = typeof WebAssembly !== "undefined";
  const isSecure = window.isSecureContext !== false;
  return hasMic && hasRecorder && hasAudio && hasWasm && isSecure;
}

/** True once the model has been loaded in this page (or is loading). */
export function isLoading(): boolean {
  return pipePromise !== null;
}

/**
 * Download (or pull from the browser cache) the library and the model.
 * Safe to call more than once; resolves when the pipeline is ready.
 */
export function preload(onProgress?: (p: Progress) => void): Promise<void> {
  cancelled = false;
  if (!pipePromise) {
    pipePromise = loadPipeline(onProgress).catch((err) => {
      pipePromise = null; // let a later attempt start clean
      throw err;
    });
  }
  return pipePromise.then(() => undefined);
}

/** Stop a download in progress. A later preload() starts again (cached files are reused). */
export function cancel(): void {
  cancelled = true;
  pipePromise = null;
}

async function loadPipeline(onProgress?: (p: Progress) => void): Promise<AsrPipeline> {
  if (!isSupported()) throw new VoiceError("unsupported");
  let mod: Record<string, unknown>;
  try {
    mod = await buildImportUrl()(LIB_URL);
  } catch {
    throw new VoiceError("model-download-failed", "library");
  }
  if (cancelled) throw new VoiceError("cancelled");

  const env = mod.env as { allowLocalModels?: boolean; useBrowserCache?: boolean } | undefined;
  if (env) {
    env.allowLocalModels = false;
    env.useBrowserCache = true;
  }
  const pipeline = mod.pipeline as (task: string, model: string, opts: Record<string, unknown>) => Promise<AsrPipeline>;

  // Per-file progress, folded into one percentage.
  const seen = new Map<string, { loaded: number; total: number }>();
  const report = (file: string, loaded: number, total: number) => {
    seen.set(file, { loaded, total });
    let l = 0;
    let t = 0;
    for (const v of seen.values()) {
      l += v.loaded;
      t += v.total;
    }
    const percent = t > 0 ? Math.max(0, Math.min(100, Math.round((l / t) * 100))) : 0;
    onProgress?.({ percent, file });
  };

  try {
    const pipe = await pipeline("automatic-speech-recognition", MODEL_ID, {
      dtype: "q8",
      device: "wasm",
      progress_callback: (ev: { status?: string; file?: string; loaded?: number; total?: number; progress?: number }) => {
        if (cancelled) throw new VoiceError("cancelled");
        if (ev.status === "progress" && ev.file) {
          const total = ev.total ?? 0;
          const loaded = ev.loaded ?? (ev.progress && total ? (ev.progress / 100) * total : 0);
          report(ev.file, loaded, total);
        } else if (ev.status === "done" && ev.file) {
          const prev = seen.get(ev.file);
          report(ev.file, prev?.total ?? 1, prev?.total ?? 1);
        }
      },
    });
    if (cancelled) throw new VoiceError("cancelled");
    onProgress?.({ percent: 100 });
    return pipe;
  } catch (err) {
    if (err instanceof VoiceError) throw err;
    throw new VoiceError("model-download-failed", err instanceof Error ? err.message : "model");
  }
}

/** Decode a recording into 16 kHz mono samples. The blob is not kept. */
async function decodeToMono16k(blob: Blob): Promise<Float32Array> {
  const Ctx = (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
  let buf: AudioBuffer;
  const ctx = new Ctx();
  try {
    const bytes = await blob.arrayBuffer();
    buf = await ctx.decodeAudioData(bytes);
  } catch {
    throw new VoiceError("decode-failed");
  } finally {
    void ctx.close();
  }
  if (buf.duration < MIN_SECONDS) throw new VoiceError("too-short");

  // Mix down to mono.
  const n = buf.length;
  const mono = new Float32Array(n);
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < n; i++) mono[i] += ch[i] / buf.numberOfChannels;
  }
  if (buf.sampleRate === TARGET_RATE) return mono;

  // Resample with an OfflineAudioContext so the browser does the filtering.
  const frames = Math.ceil((n * TARGET_RATE) / buf.sampleRate);
  const off = new OfflineAudioContext(1, frames, TARGET_RATE);
  const src = off.createBufferSource();
  const monoBuf = off.createBuffer(1, n, buf.sampleRate);
  monoBuf.copyToChannel(mono, 0);
  src.buffer = monoBuf;
  src.connect(off.destination);
  src.start(0);
  const out = await off.startRendering();
  return out.getChannelData(0).slice();
}

const NOISE = /^\s*[\[(][^\])]*[\])]\s*$/; // "[BLANK_AUDIO]", "(music)" and the like

/**
 * Turn a recording into text, on this device. Rejects with a VoiceError.
 * The audio buffer is dropped as soon as the model has read it.
 */
export async function transcribe(blob: Blob, onProgress?: (p: Progress) => void): Promise<Transcript> {
  const [pipe, audio] = await Promise.all([
    (async () => {
      await preload(onProgress);
      return pipePromise as Promise<AsrPipeline>;
    })().then((p) => p),
    decodeToMono16k(blob),
  ]);
  let out: AsrOutput;
  try {
    out = await pipe(audio, { task: "transcribe", chunk_length_s: 30, stride_length_s: 10, return_timestamps: false });
  } catch (err) {
    throw new VoiceError("decode-failed", err instanceof Error ? err.message : "model");
  } finally {
    audio.fill(0); // nothing of the recording survives this function
  }
  const raw = (out.text ?? out.chunks?.map((c) => c.text ?? "").join(" ") ?? "").replace(/\s+/g, " ").trim();
  const text = NOISE.test(raw) ? "" : raw;
  const language = out.language ?? out.chunks?.find((c) => c.language)?.language;
  return { text, language: language || undefined };
}

/** A human word for a Whisper language code, for the "heard italian" line. */
export function languageName(code: string | undefined): string | undefined {
  if (!code) return undefined;
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "language" });
    return dn.of(code)?.toLowerCase();
  } catch {
    return code;
  }
}
