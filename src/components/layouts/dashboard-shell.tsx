"use client";
import Link from "next/link";
import { BrandMark } from "@/components/shared/brand-mark";
import { Dialog } from "radix-ui";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, LogOut, ChevronRight } from "lucide-react";
import { appConfig, navigation } from "@/config/app";
import { authClient } from "@/modules/auth/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/providers";
import { cn } from "@/lib/utils";
export function DashboardShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const title = navigation().find((n) => n.href === path)?.label ?? "Workspace";
  const sidebar = (
    <>
      <Link
        className="mb-12 flex items-center gap-3 px-2 text-lg font-semibold"
        href="/dashboard"
      >
        <BrandMark size={23} />
        {appConfig.name}
      </Link>
      <p className="mb-4 px-3 text-[10px] font-medium tracking-widest text-muted-foreground">
        WORKSPACE
      </p>
      <nav className="space-y-1">
        {navigation().map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            aria-current={path === n.href ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted",
              path === n.href && "bg-muted font-medium text-foreground",
            )}
          >
            <span className="font-mono text-[10px] opacity-60">0{i + 1}</span>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <Link
          className="flex justify-between rounded-lg border border-border p-3 text-xs"
          href="/docs"
        >
          Make it your own
          <ArrowUpRight size={14} />
        </Link>
        <div className="mt-6 flex items-center gap-3 px-1">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">Your account</p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Sign out"
            onClick={async () => {
              await authClient.signOut();
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </>
  );
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card p-5 md:flex">
          {sidebar}
        </aside>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 md:hidden" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card p-5 md:hidden">
            <Dialog.Title className="sr-only">
              Workspace navigation
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Choose a page in your workspace.
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button
                className="absolute right-2 top-2"
                variant="ghost"
                size="icon"
                aria-label="Close navigation"
              >
                ×
              </Button>
            </Dialog.Close>
            {sidebar}
          </Dialog.Content>
        </Dialog.Portal>
        <div className="md:ml-60">
          <header className="flex h-20 items-center justify-between border-b border-border px-6 md:px-10">
            <div className="flex items-center gap-3">
              <Dialog.Trigger asChild>
                <Button
                  className="md:hidden"
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                >
                  <Menu size={18} />
                </Button>
              </Dialog.Trigger>
              <span className="text-sm text-muted-foreground">Workspace</span>
              <ChevronRight size={12} className="text-muted-foreground" />
              <span className="text-sm">{title}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/docs" className="text-xs text-muted-foreground">
                Docs ↗
              </Link>
              <ThemeToggle />
            </div>
          </header>
          <main id="main" className="mx-auto max-w-7xl p-6 md:p-10">
            {children}
          </main>
        </div>
      </div>
    </Dialog.Root>
  );
}
