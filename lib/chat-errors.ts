export const CHAT_ERROR_MESSAGES: Record<string, string> = {
  ai_off: "Chat isn't switched on yet.",
  ai_unavailable: "Fix couldn't connect right now. Give it a sec and try again.",
  // New in fix #4: distinguish the common mid-stream drop (ai_dropped) and the
  // outright request timeout (ai_timeout) from the generic connect-failed message,
  // so a user who sees one of these tries the right thing — a quick resend vs a
  // moment's wait before resending.
  ai_dropped: "The AI dropped partway through. Your words are still here — tap to send them again.",
  ai_timeout: "Fix took too long on that one. Tap to try again.",
  not_usable: "Can't use that one. A chat screenshot or a photo of the place, nothing with people in it.",
  screenshot_limit: "That's today's images. Keep typing though.",
  screenshot_off: "Images aren't switched on yet.",
  // New in the fix-#1 quota round so a daily-cap trip on voice notes reads clearly,
  // rather than falling through to the generic "That didn't come through" message.
  voice_limit: "That's today's voice notes. Keep typing though.",
  voice_off: "Voice notes aren't switched on yet.",
  bad_image: "Couldn't read that image.",
  timeout: "Fix didn't respond in time. Try again?",
  too_many_requests: "We're a bit overloaded right now. Give it a minute and try again.",
  server_error: "Something went wrong on our end. Try again?",
  network_error: "Couldn't connect. Check your internet and try again.",
};

export function errorText(code?: string, detail?: string): string {
  const message = CHAT_ERROR_MESSAGES[code ?? ""];

  if (message) {
    return detail ? `${message} (${detail})` : message;
  }

  return "That didn't come through. Try again.";
}