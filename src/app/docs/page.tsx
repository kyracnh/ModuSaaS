import Link from "next/link";
import { Card } from "@/components/ui/card";
import { appConfig } from "@/config/app";
export default function Page() {
  return (
    <main id="main" className="mx-auto max-w-4xl px-6 py-16">
      <Link className="text-sm text-muted-foreground" href="/">
        ← {appConfig.name}
      </Link>
      <h1 className="mt-8 text-4xl">A foundation you can understand.</h1>
      <p className="my-6 leading-8 text-muted-foreground">
        One Next.js application. A PostgreSQL database. Clear module boundaries.
        Start with the essentials and add only what your product needs.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {[
          [
            "Get running",
            "Install Node 24 and pnpm. Run pnpm install, configure PostgreSQL, pnpm setup, then pnpm dev.",
          ],
          [
            "Make it yours",
            "Edit src/config/app.ts for branding and presets. Change design tokens in src/app/globals.css. Rebuild after public configuration changes.",
          ],
          [
            "Build a feature",
            "Follow src/modules/projects: schema, authorized service, API handler, validated form, and isolation tests.",
          ],
          [
            "Enable integrations",
            "Choose the full preset for optional billing, AI and files. Configure the matching server-side providers; core functionality works without them.",
          ],
        ].map(([title, text]) => (
          <Card key={title}>
            <h2 className="text-lg font-medium">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {text}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-6 text-sm underline">
        <Link href="/dashboard">Your workspace</Link>
        {process.env.NODE_ENV !== "production" && (
          <Link href="/gallery">Component gallery</Link>
        )}
        <a href="https://github.com/kyracnh/ModuSaaS/tree/main/docs">
          Repository documentation
        </a>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Engineering preview. IMPLEMENTATION_STATUS.md documents checks and
        release limitations. No measured token-saving claim is made.
      </p>
    </main>
  );
}
