import { requireUser } from "@/modules/auth/session";
import { InviteAccept } from "@/components/forms/invite-accept";
import { appConfig } from "@/config/app";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!appConfig.features.organizations) notFound();
  await requireUser();
  const { id } = await params;
  return (
    <main id="main" className="mx-auto max-w-md px-6 py-24">
      <h1 className="mb-6 text-3xl">Join your team.</h1>
      <InviteAccept id={id} />
    </main>
  );
}
