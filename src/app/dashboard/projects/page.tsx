import { ProjectManager } from "@/components/forms/project-manager";
export default function Page() {
  return (
    <>
      <h1 className="text-3xl font-medium">Projects</h1>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        A home for the things you’re working on.
      </p>
      <ProjectManager />
    </>
  );
}
