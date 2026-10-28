import { Suspense } from "react";
import { RecoveryForm } from "@/components/forms/recovery-form";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl">Forgot your password?</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        We’ll send you a secure reset link.
      </p>
      <Suspense>
        <RecoveryForm />
      </Suspense>
    </>
  );
}
