import { redirect } from "next/navigation";

// /fix is the Fix-tab target in the new app nav. The chat flow currently lives at /app
// (components/FreezeFixApp.tsx) and will be moved under the new shell in a later PR.
// For PR A we redirect so the nav tab lands in the working chat without duplication.
// metadata deliberately omitted — a redirect page should not advertise itself.
export default function Page() {
  redirect("/app");
}
