import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { ArrowLeft } from "lucide-react";
import { appConfig } from "@/config/app";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-14 text-primary-foreground lg:flex">
        <Link className="flex items-center gap-3 text-xl font-medium" href="/">
          <BrandMark />
          {appConfig.name}
        </Link>
        <div>
          <p className="mb-5 text-xs tracking-widest opacity-60">
            YOUR NEXT CHAPTER
          </p>
          <h1 className="max-w-lg text-5xl leading-tight">
            Great products start with a solid foundation.
          </h1>
          <p className="mt-6 max-w-sm text-sm leading-7 opacity-75">
            The building blocks are here. Make something that matters.
          </p>
        </div>
        <p className="text-xs opacity-60">Open source. Endlessly adaptable.</p>
      </aside>
      <section className="flex flex-col p-6 md:p-12">
        <Link
          className="flex items-center gap-2 text-sm text-muted-foreground"
          href="/"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
        <div className="m-auto w-full max-w-sm py-16">{children}</div>
      </section>
    </main>
  );
}
