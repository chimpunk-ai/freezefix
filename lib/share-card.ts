// Minimal stub for bisection — if THIS passes Workers Builds, the problem
// is in the full implementation; if it fails, the problem is somewhere else
// (import chain, test wiring, or the PatternCard changes).

export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

export type ShareOptions = {
  name: string;
  // Keep the stats field compatible with the full version so the component
  // compiles unchanged while we bisect which bit of the full file trips
  // Workers Builds.
  stats: unknown;
  redactName?: boolean;
};

export function canShareImages(): boolean {
  return false;
}

export async function sundayCardBlob(_opts: ShareOptions): Promise<Blob | null> {
  return null;
}

export async function shareSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}

export async function downloadSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}
