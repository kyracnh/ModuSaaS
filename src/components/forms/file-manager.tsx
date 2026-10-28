"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function FileManager() {
  const [files, setFiles] = useState<
    { id: string; name: string; size: number }[]
  >([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setFiles(await clientApi("/api/files"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    clientApi<{ id: string; name: string; size: number }[]>("/api/files")
      .then(setFiles)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <Card>
      <form
        className="flex flex-wrap gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          try {
            const response = await fetch("/api/files", {
              method: "POST",
              body: new FormData(form),
            });
            if (!response.ok) throw new Error((await response.json()).error);
            form.reset();
            await load();
            toast.success("File uploaded");
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <Input
          name="file"
          type="file"
          aria-label="Choose a file"
          accept="image/png,image/jpeg,application/pdf"
          required
          className="max-w-sm"
        />
        <Button>Upload file</Button>
      </form>
      <p className="my-4 text-xs text-muted-foreground">
        PNG, JPEG or PDF · up to 5 MiB · private downloads
      </p>
      {error && <p role="alert">{error}</p>}
      {!files.length && (
        <p className="py-8 text-sm text-muted-foreground">
          No files uploaded yet.
        </p>
      )}
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between border-t border-border py-4 text-sm"
        >
          <a className="underline" href={"/api/files/" + f.id}>
            {f.name}
          </a>
          <span className="text-xs text-muted-foreground">
            {(f.size / 1024).toFixed(1)} KB
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await clientApi("/api/files/" + f.id, { method: "DELETE" });
                await load();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </Card>
  );
}
