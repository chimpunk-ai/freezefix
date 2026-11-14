// Minimal stub for the diagnostic: does the mere presence of lib/reminders.ts
// break the Cloudflare Workers deploy? If this empty file breaks it, something
// about the file *path* or the tsconfig include is to blame, not its content.

export type ReminderKind = "sunday" | "nightly";
