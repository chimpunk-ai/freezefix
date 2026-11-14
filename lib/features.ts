// Optional inputs are built but stay OFF until they're switched on in Cloudflare settings.
// Founder approved screenshots for the beta (16 Oct). Before switching them on:
//   - Safety & Trust: screenshot rules + Hindi/Hinglish red flags (HQ T31)
//   - Setup & Legal: privacy policy + consent updated for screenshots (HQ T32)
// Set ENABLE_SCREENSHOTS=true only after those are Done.
//
// Voice notes no longer have a switch or a provider: they are transcribed on
// the device (lib/transcribe.ts), so there is nothing server-side to enable.

export function screenshotsOn(): boolean {
  if (process.env.ENABLE_SCREENSHOTS === "false") return false;
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
