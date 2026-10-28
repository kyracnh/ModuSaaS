import { notFound } from "next/navigation";
import Link from "next/link";
import { ComponentGallery } from "@/components/shared/component-gallery";
export default function Page() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_COMPONENT_GALLERY !== "1"
  )
    notFound();
  return (
    <main id="main" className="mx-auto max-w-6xl px-6 py-12">
      <Link className="text-sm text-muted-foreground" href="/dashboard">
        ← Back to workspace
      </Link>
      <h1 className="mt-8 text-4xl">The building blocks.</h1>
      <p className="mb-8 mt-3 text-muted-foreground">
        Interactive components and copyable patterns. Available in development.
      </p>
      <ComponentGallery />
    </main>
  );
}
