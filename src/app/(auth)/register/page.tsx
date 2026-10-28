import { AuthForm } from "@/components/forms/auth-form";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-medium">Make it your own.</h1>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        Create an account to start your workspace.
      </p>
      <AuthForm register />
    </>
  );
}
