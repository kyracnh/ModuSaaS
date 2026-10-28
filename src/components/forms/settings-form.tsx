"use client";
import { PreferencesForm } from "./preferences-form";
import { ContactForm } from "./contact-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/modules/auth/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
export function SettingsForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h2 className="text-lg font-medium">Your profile</h2>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">
          How you appear in your workspace.
        </p>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const data = new FormData(e.currentTarget);
            try {
              const r = await authClient.updateUser({
                name: String(data.get("name")),
              });
              if (r.error) throw new Error(r.error.message);
              toast.success("Profile updated");
              router.refresh();
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field>
            <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
            <Input
              id="profile-name"
              name="name"
              defaultValue={name}
              required
              minLength={2}
              maxLength={100}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="profile-email">Email</FieldLabel>
            <Input id="profile-email" value={email} disabled />
          </Field>
          <Button disabled={busy}>Save profile</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-medium">Change password</h2>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const d = new FormData(form);
            setBusy(true);
            try {
              const result = await authClient.changePassword({
                currentPassword: String(d.get("current")),
                newPassword: String(d.get("new")),
                revokeOtherSessions: true,
              });
              if (result.error) throw new Error(result.error.message);
              toast.success("Password changed; other sessions revoked");
              form.reset();
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {[
            ["current", "Current password"],
            ["new", "New password"],
          ].map(([id, label]) => (
            <Field key={id}>
              <FieldLabel htmlFor={id}>{label}</FieldLabel>
              <Input
                id={id}
                name={id}
                type="password"
                autoComplete={
                  id === "new" ? "new-password" : "current-password"
                }
                minLength={id === "new" ? 12 : undefined}
                maxLength={128}
                required
              />
            </Field>
          ))}
          <Button disabled={busy} variant="outline">
            Update password
          </Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-medium">Notification preferences</h2>
        <PreferencesForm />
      </Card>
      <Card>
        <h2 className="mb-5 text-lg font-medium">Contact support</h2>
        <ContactForm />
      </Card>
      <Card>
        <h2 className="text-lg font-medium">Delete account</h2>
        <p className="my-3 text-sm text-muted-foreground">
          This permanently removes your account and personal data. Transfer or
          delete any owned workspaces first. Cancel provider subscriptions
          before deletion.
        </p>
        {!confirm ? (
          <Button variant="destructive" onClick={() => setConfirm(true)}>
            Delete my account
          </Button>
        ) : (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const password = String(
                new FormData(e.currentTarget).get("password"),
              );
              setBusy(true);
              try {
                const result = await authClient.deleteUser({ password });
                if (result.error) throw new Error(result.error.message);
                router.push("/");
                router.refresh();
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field>
              <FieldLabel htmlFor="delete-password">
                Confirm with your password
              </FieldLabel>
              <Input
                id="delete-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Button disabled={busy} variant="destructive">
              Permanently delete account
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setConfirm(false)}
            >
              Cancel
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
