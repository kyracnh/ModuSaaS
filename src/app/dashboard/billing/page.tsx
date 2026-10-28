import { appConfig } from "@/config/app";
import { notFound } from "next/navigation";
import { BillingPanel } from "@/components/forms/billing-panel";
export default function Page() {
  if (!appConfig.features.billing) notFound();
  return (
    <>
      <h1 className="mb-8 text-3xl">Billing</h1>
      <BillingPanel />
    </>
  );
}
