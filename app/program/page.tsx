import { redirect } from "next/navigation";

/** The former reduction-plan product has been retired in favor of the private weekly mirror. */
export default function ProgramPage() {
  redirect("/home");
}
