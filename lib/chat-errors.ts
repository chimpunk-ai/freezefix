export const CHAT_ERROR_MESSAGES: Record<string, string> = {
  ai_off: "Chat isn't switched on yet.",
  ai_unavailable: "Fix couldn't connect right now. Give it a sec and try again.",
  not_usable: "Can't use that one. A chat screenshot or a photo of the place, nothing with people in it.",
  screenshot_limit: "That's today's images. Keep typing though.",
  screenshot_off: "Images aren't switched on yet.",
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