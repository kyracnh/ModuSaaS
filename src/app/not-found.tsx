import Link from "next/link";
export default function Page() {
  return (
    <main id="main" className="p-16 text-center">
      <h1 className="text-4xl">Page not found.</h1>
      <p className="my-5 text-muted-foreground">
        This page doesn’t exist or the module is disabled.
      </p>
      <Link className="underline" href="/">
        Back to home
      </Link>
    </main>
  );
}
