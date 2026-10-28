"use client";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/modules/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProjectManager } from "./project-manager";
export function WorkspaceManager() {
  const { data: orgs, refetch } = authClient.useListOrganizations();
  const { data: active, refetch: refresh } = authClient.useActiveOrganization();
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 text-lg">Your workspaces</h2>
        <select
          aria-label="Active workspace"
          value={active?.id ?? ""}
          onChange={async (e) => {
            const r = await authClient.organization.setActive({
              organizationId: e.target.value || null,
            });
            if (r.error) toast.error(r.error.message);
            await refresh();
          }}
        >
          <option value="">Select a workspace</option>
          {orgs?.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        <form
          className="mt-5 flex gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const name = String(new FormData(form).get("name"));
            setBusy(true);
            const r = await authClient.organization.create({
              name,
              slug:
                name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
                "-" +
                crypto.randomUUID().slice(0, 6),
            });
            setBusy(false);
            if (r.error) toast.error(r.error.message);
            else {
              form.reset();
              await refetch();
              await refresh();
              toast.success("Workspace created");
            }
          }}
        >
          <Input
            name="name"
            aria-label="Workspace name"
            placeholder="New workspace name"
            required
            minLength={2}
            maxLength={100}
          />
          <Button disabled={busy}>Create</Button>
        </form>
      </Card>
      {active && (
        <>
          <Card>
            <h2 className="mb-5 text-lg">{active.name} · Members</h2>
            <ul className="divide-y divide-border">
              {active.members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span>
                    {m.user.name}{" "}
                    <span className="text-muted-foreground">
                      {m.user.email}
                    </span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs">{m.role}</span>
                    {m.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const r = await authClient.organization.removeMember({
                            memberIdOrEmail: m.id,
                            organizationId: active.id,
                          });
                          if (r.error) toast.error(r.error.message);
                          else await refresh();
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="mb-3 mt-6 font-medium">Invite a teammate</h3>
            <form
              className="flex flex-wrap gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const d = new FormData(form);
                const result = await authClient.organization.inviteMember({
                  email: String(d.get("email")),
                  role: String(d.get("role")) as "admin" | "member",
                  organizationId: active.id,
                });
                if (result.error) toast.error(result.error.message);
                else {
                  toast.success("Invitation sent");
                  form.reset();
                  await refresh();
                }
              }}
            >
              <Input
                name="email"
                type="email"
                aria-label="Invitation email"
                placeholder="teammate@example.com"
                required
                className="max-w-xs"
              />
              <select name="role" aria-label="Invitation role">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button>Send invitation</Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              Owners and admins can invite members. SMTP must be configured.
            </p>
            <h3 className="mb-3 mt-6 font-medium">Workspace settings</h3>
            <form
              className="flex gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                const name = String(new FormData(e.currentTarget).get("name"));
                const r = await authClient.organization.update({
                  organizationId: active.id,
                  data: { name },
                });
                if (r.error) toast.error(r.error.message);
                else {
                  toast.success("Workspace updated");
                  await refresh();
                  await refetch();
                }
              }}
            >
              <Input
                name="name"
                aria-label="Rename workspace"
                defaultValue={active.name}
                required
                minLength={2}
              />
              <Button variant="outline">Rename</Button>
            </form>
          </Card>
          <div>
            <h2 className="mb-5 text-xl">Workspace projects</h2>
            <ProjectManager key={active.id} organizationId={active.id} />
          </div>
        </>
      )}
    </div>
  );
}
