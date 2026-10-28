import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import {
  ArrowRight,
  ShieldCheck,
  Database,
  Sparkles,
  Check,
  Code2,
} from "lucide-react";
import { appConfig } from "@/config/app";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/providers";
export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <BrandMark />
          {appConfig.name}
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link href="/docs">Documentation</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">
              Get started <ArrowRight size={15} />
            </Link>
          </Button>
        </div>
      </header>
      <main id="main">
        <section className="mx-auto grid max-w-6xl gap-14 px-6 pb-24 pt-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge>OPEN SOURCE. YOURS TO BUILD ON.</Badge>
            <h1 className="mt-7 text-5xl font-medium leading-[1.08] md:text-7xl">
              Less setup.
              <br />
              More <span className="text-muted-foreground">possibility.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              A thoughtful foundation for your next SaaS. Authentication,
              workspaces, and reusable building blocks — ready for your own
              ideas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/register">
                  Start building <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com/kyracnh/ModuSaaS">
                  <Code2 size={16} /> View source
                </a>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              MIT licensed · PostgreSQL · No paid services required
            </p>
          </div>
          <Card className="overflow-hidden !p-0">
            <div className="flex items-center gap-1.5 border-b border-border px-5 py-4">
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border" />
              <span className="ml-4 text-xs text-muted-foreground">
                Your next project starts here
              </span>
            </div>
            <div className="p-7">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-medium">
                  A foundation, thoughtfully connected.
                </span>
                <BrandMark />
              </div>
              {[
                ["01", "Identity", "Authentication & secure sessions"],
                ["02", "Your data", "Typed models & scoped queries"],
                ["03", "Your product", "Reusable forms & components"],
                ["04", "Your choice", "Optional providers & deployment"],
              ].map(([n, title, sub]) => (
                <div
                  key={n}
                  className="flex items-center gap-5 border-t border-border py-5"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <Check size={15} className="ml-auto text-muted-foreground" />
                </div>
              ))}
              <div className="mt-4 rounded-lg bg-muted px-4 py-3 font-mono text-xs">
                $ pnpm setup && pnpm dev
              </div>
            </div>
          </Card>
        </section>
        <section id="features" className="border-y border-border bg-card py-20">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-xs font-medium tracking-widest text-muted-foreground">
              THE ESSENTIALS, ALREADY CONSIDERED
            </p>
            <h2 className="mt-4 text-3xl font-medium">
              Build your product. Keep the foundation.
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [
                  ShieldCheck,
                  "Identity you can build on",
                  "Email and password authentication, protected routes, and server-side authorization.",
                ],
                [
                  Database,
                  "Data with boundaries",
                  "PostgreSQL, typed Prisma queries, and a complete resource management example.",
                ],
                [
                  Sparkles,
                  "Room for what comes next",
                  "Optional teams, billing, storage, and AI. Enable what your product actually needs.",
                ],
              ].map(([Icon, title, text]) => (
                <Card key={String(title)}>
                  {typeof Icon !== "string" && <Icon size={22} />}
                  <h3 className="mt-6 font-medium">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {String(text)}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-medium">
            A free foundation. Your business model.
          </h2>
          <p className="mt-4 text-muted-foreground">
            The software is free. These configurable example plans demonstrate
            app entitlements.
          </p>
          <div className="mt-8 grid max-w-3xl gap-5 md:grid-cols-2">
            {Object.entries(appConfig.plans).map(([key, p]) => (
              <Card key={key}>
                <Badge>{p.name}</Badge>
                <h3 className="my-5 text-2xl font-medium">
                  {key === "free"
                    ? "Start with the essentials"
                    : "Grow with your product"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {p.projectLimit} projects · {p.aiRequestsPerDay} daily AI
                  requests when enabled
                </p>
                <Button asChild className="mt-7">
                  <Link href="/register">Create an account</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-6xl border-t border-border px-6 py-16">
          <h2 className="mb-6 text-3xl font-medium">A few things to know.</h2>
          {[
            [
              "Do I need Docker?",
              "No. Run a single Next.js application with a local or managed PostgreSQL database.",
            ],
            [
              "Do I need paid API keys?",
              "No. Core authentication, projects, and the dashboard work without paid services.",
            ],
            [
              "Is the 95% token saving measured?",
              "No. It is an aspirational goal. The repository provides a benchmark method, not an unsupported result.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="border-b border-border py-5">
              <summary className="font-medium">{q}</summary>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-border px-6 py-8 text-sm text-muted-foreground">
        <p>{appConfig.name} · Built to become your own.</p>
        <div className="flex gap-5">
          {appConfig.footer.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  );
}
