// Optional inputs are built but stay OFF until they're switched on in Cloudflare settings.
// Founder approved screenshots + voice for the beta (16 Oct). Before switching them on:
//   - Safety & Trust: screenshot rules + Hindi/Hinglish red flags (HQ T31)
//   - Setup & Legal: privacy policy + consent updated for screenshots/voice (HQ T32)
//   - Budget & Ops: transcription provider + cost cap approved (HQ T33)
// Set ENABLE_SCREENSHOTS=true / ENABLE_VOICE=true only after those are Done.

export function screenshotsOn(): boolean {
  if (process.env.ENABLE_SCREENSHOTS === "false") return false;
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function voiceOn(): boolean {
  return process.env.ENABLE_VOICE === "true" && Boolean(process.env.TRANSCRIBE_API_KEY);
}
