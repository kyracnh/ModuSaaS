import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  FolderOpen,
  CheckCircle2,
  Users,
} from "lucide-react";
import { requireUser } from "@/modules/auth/session";
import { listProjects } from "@/modules/projects/service";
import { db } from "@/server/db";
import { appConfig } from "@/config/app";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default async function Dashboard() {
  const s = await requireUser();
  const { items, total } = await listProjects(s.user.id);
  const completed = await db.project.count({
    where: { userId: s.user.id, organizationId: null, status: "completed" },
  });
  const members = appConfig.features.organizations
    ? await db.member.count({ where: { userId: s.user.id } })
    : null;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            YOUR WORKSPACE AT A GLANCE
          </p>
          <h1 className="mt-3 text-3xl font-medium">
            Welcome back, {s.user.name.split(" ")[0]}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            A little clarity for whatever you’re building next.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects">
            <Plus size={16} />
            New project
          </Link>
        </Button>
      </div>
      <div className="my-9 grid gap-5 sm:grid-cols-3">
        {[
          [FolderOpen, "Total projects", total],
          [CheckCircle2, "Completed", completed],
          [
            Users,
            members === null ? "Account" : "Workspaces",
            members === null ? "Individual" : members,
          ],
        ].map(([Icon, label, value]) => (
          <Card key={String(label)}>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{String(label)}</span>
              {typeof Icon !== "string" &&
                typeof Icon !== "number" &&
                Icon !== null && <Icon size={17} />}
            </div>
            <p className="mt-5 text-4xl font-medium">{String(value)}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Live data from your workspace
            </p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recent projects</h2>
            <Link
              className="text-xs text-muted-foreground"
              href="/dashboard/projects"
            >
              View all ↗
            </Link>
          </div>
          {items.length ? (
            <div className="mt-6 divide-y divide-border">
              {items.slice(0, 5).map((p) => (
                <Link
                  href="/dashboard/projects"
                  key={p.id}
                  className="flex items-center gap-4 py-4"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <FolderOpen size={18} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.updatedAt.toLocaleDateString("en-US")}
                    </p>
                  </div>
                  <Badge>{p.status}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <FolderOpen className="mx-auto text-muted-foreground" size={28} />
              <h3 className="mt-5 text-lg font-medium">
                Your next idea belongs here.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first project to bring this workspace to life.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/dashboard/projects">Create a project</Link>
              </Button>
            </div>
          )}
        </Card>
        <div className="space-y-5">
          <Card className="!bg-primary text-primary-foreground">
            <Badge>BUILT FOR YOUR IDEAS</Badge>
            <h2 className="mt-5 text-2xl font-medium">
              A head start.
              <br />
              An open canvas.
            </h2>
            <p className="mt-3 text-sm leading-6 opacity-75">
              Customize your brand, explore the building blocks, and make this
              product yours.
            </p>
            <Link className="mt-6 flex items-center gap-2 text-sm" href="/docs">
              Explore the guide
              <ArrowUpRight size={15} />
            </Link>
          </Card>
          <Card>
            <h2 className="text-sm font-medium">A good place to start</h2>
            {[
              ["Update your profile", "/dashboard/settings"],
              ["Explore the components", "/gallery"],
              ["Read the docs", "/docs"],
            ].map(([label, href]) => (
              <Link
                key={href}
                className="mt-4 flex justify-between text-xs text-muted-foreground"
                href={href}
              >
                {label}
                <ArrowUpRight size={13} />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
