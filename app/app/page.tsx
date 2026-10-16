import { Suspense } from "react";
import FreezeFixApp from "@/components/FreezeFixApp";

// The app. A ?s=<scenario id> on the URL opens straight into that conversation, which is how
// the landing page's cards hand over.
export default function Page() {
  return (
    <Suspense fallback={null}>
      <FreezeFixApp />
    </Suspense>
  );
}
