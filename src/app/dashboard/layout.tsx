import { requireUser } from "@/modules/auth/session";
import { DashboardShell } from "@/components/layouts/dashboard-shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await requireUser();
  return <DashboardShell name={s.user.name}>{children}</DashboardShell>;
}
