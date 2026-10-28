"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="p-12">
      <h1 className="mb-4 text-2xl">We couldn’t load this page.</h1>
      <p className="mb-6 text-muted-foreground">
        Try again. If the problem continues, contact your administrator.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
