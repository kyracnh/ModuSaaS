import { appConfig } from "@/config/app";
import { notFound } from "next/navigation";
import { FileManager } from "@/components/forms/file-manager";
export default function Page() {
  if (!appConfig.features.storage) notFound();
  return (
    <>
      <h1 className="mb-8 text-3xl">Files</h1>
      <FileManager />
    </>
  );
}
