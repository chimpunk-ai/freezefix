import type { Metadata } from "next";
import ProductPlanPage from "@/components/ProductPlanPage";

export const metadata: Metadata = {
  title: "How Fix is being built",
  description: "A detailed explanation of Fix's cannabis check-in, private weekly mirror, product boundaries, privacy design, and launch readiness.",
  alternates: { canonical: "https://getfreezefix.com/product" },
};

export default function ProductPage() {
  return <ProductPlanPage />;
}
