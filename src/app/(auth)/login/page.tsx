import { AuthForm } from "@/components/forms/auth-form";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-medium">Welcome back.</h1>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        Sign in to pick up where you left off.
      </p>
      <AuthForm />
    </>
  );
}
