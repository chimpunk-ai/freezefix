import type { Metadata } from "next";
import Tools from "@/components/Tools";

export const metadata: Metadata = {
  title: "Everyday tools",
  description:
    "Small help for real moments: a respectful message, a first step on a task, or a calm look at two options. Nothing is sent anywhere.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <Tools />;
}
