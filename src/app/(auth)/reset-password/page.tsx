import { Suspense } from "react";
import { RecoveryForm } from "@/components/forms/recovery-form";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl">Choose a new password.</h1>
      <Suspense>
        <RecoveryForm reset />
      </Suspense>
    </>
  );
}
