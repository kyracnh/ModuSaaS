import { notFound } from "next/navigation";
import { appConfig } from "@/config/app";
import { AiChat } from "@/components/forms/ai-chat";
export default function Page() {
  if (!appConfig.features.ai) notFound();
  return (
    <>
      <h1 className="text-3xl">AI studio</h1>
      <p className="mb-8 mt-3 text-sm text-muted-foreground">
        A reusable starting point for thoughtful AI features.
      </p>
      <AiChat />
    </>
  );
}
