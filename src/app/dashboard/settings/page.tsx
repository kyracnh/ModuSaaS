import { requireUser } from "@/modules/auth/session";
import { SettingsForm } from "@/components/forms/settings-form";
export default async function Page() {
  const s = await requireUser();
  return (
    <>
      <h1 className="text-3xl font-medium">Account settings</h1>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        A few details that make this workspace yours.
      </p>
      <SettingsForm name={s.user.name} email={s.user.email} />
    </>
  );
}
