import { redirect } from "next/navigation";

/** Weekly goals now live beside the daily log; the old plan builder is retired. */
export default function PlansPage() {
  redirect("/home");
}
