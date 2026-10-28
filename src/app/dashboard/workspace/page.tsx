import { notFound } from "next/navigation";
import { appConfig } from "@/config/app";
import { WorkspaceManager } from "@/components/forms/workspace-manager";
export default function Page() {
  if (!appConfig.features.organizations) notFound();
  return (
    <>
      <h1 className="mb-8 text-3xl font-medium">Workspaces</h1>
      <WorkspaceManager />
    </>
  );
}
