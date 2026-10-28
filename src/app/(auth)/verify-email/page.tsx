import Link from "next/link";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl">Check your inbox.</h1>
      <p className="my-5 text-muted-foreground">
        Follow the verification link we sent to your email address.
      </p>
      <Link className="underline" href="/login">
        Return to sign in
      </Link>
    </>
  );
}
