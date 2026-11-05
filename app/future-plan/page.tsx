import { redirect } from "next/navigation";

export const metadata = {
  title: "Pricing — Fix",
  description: "See the planned Fix launch offer. No payment or trial begins from the launch waitlist.",
  robots: { index: false, follow: false },
};

export default function FuturePlanRedirect() {
  redirect("/pricing");
}
