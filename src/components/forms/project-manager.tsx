"use client";
import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Dialog } from "radix-ui";
import { projectSchema, type ProjectInput } from "@/modules/projects/schema";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, Badge } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";
type Project = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
};
export function ProjectManager({
  organizationId,
}: {
  organizationId?: string;
}) {
  const [data, setData] = useState<{ items: Project[]; total: number }>({
    items: [],
    total: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const form = useForm<z.input<typeof projectSchema>, unknown, ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", status: "active" },
  });
  const url =
    "/api/projects?" +
    new URLSearchParams({
      search,
      page: String(page),
      sort,
      status,
      ...(organizationId ? { organizationId } : {}),
    });
  const load = useCallback(async () => {
    try {
      setData(await clientApi(url));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    const t = setTimeout(() => void load(), 150);
    return () => clearTimeout(t);
  }, [load]);
  return (
    <>
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <label className="relative">
            <Search
              className="absolute left-3 top-3 text-muted-foreground"
              size={15}
            />
            <Input
              aria-label="Search projects"
              placeholder="Search projects…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {["active", "paused", "completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Sort projects"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="createdAt">Newest first</option>
            <option value="name">Name</option>
          </select>
        </div>
        <Button
          onClick={() => {
            setEdit(null);
            form.reset({ name: "", description: "", status: "active" });
            setOpen(true);
          }}
        >
          <Plus size={15} />
          New project
        </Button>
      </div>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}
      <Card className="overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-muted-foreground">
            <tr>
              {["Name", "Status", "Created", "Actions"].map((h) => (
                <th key={h} scope="col" className="p-5 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="p-5">
                  <p className="font-medium">{p.name}</p>
                  <p className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </td>
                <td className="p-5">
                  <Badge>{p.status}</Badge>
                </td>
                <td className="p-5 text-xs text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="p-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${p.name}`}
                    onClick={() => {
                      setEdit(p);
                      form.reset(p);
                      setOpen(true);
                    }}
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.items.length && (
          <div className="p-14 text-center text-sm text-muted-foreground">
            {loading
              ? "Loading projects…"
              : search
                ? "No projects match your search."
                : "No projects yet. Create your first one."}
          </div>
        )}
      </Card>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {data.total} projects · Page {page}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * 20 >= data.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-7">
            <Dialog.Title className="text-xl font-medium">
              {edit ? "Edit project" : "New project"}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              Give your next idea a place to grow.
            </Dialog.Description>
            <form
              className="mt-6 space-y-4"
              onSubmit={form.handleSubmit(async (v) => {
                try {
                  await clientApi(
                    "/api/projects" +
                      (organizationId
                        ? "?organizationId=" + organizationId
                        : ""),
                    {
                      method: edit ? "PATCH" : "POST",
                      body: JSON.stringify({
                        ...v,
                        ...(edit ? { id: edit.id } : {}),
                      }),
                    },
                  );
                  toast.success(edit ? "Project updated" : "Project created");
                  setOpen(false);
                  await load();
                } catch (e) {
                  form.setError("root", { message: (e as Error).message });
                }
              })}
            >
              <Field>
                <FieldLabel htmlFor="project-name">Name</FieldLabel>
                <Input id="project-name" {...form.register("name")} />
                <FieldError>{form.formState.errors.name?.message}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea id="description" {...form.register("description")} />
                <FieldError>
                  {form.formState.errors.description?.message}
                </FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select id="status" {...form.register("status")}>
                  {["active", "paused", "completed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <FieldError>{form.formState.errors.root?.message}</FieldError>
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button disabled={form.formState.isSubmitting}>
                  Save project
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-7">
            <Dialog.Title className="text-xl">Delete project?</Dialog.Title>
            <Dialog.Description className="my-4 text-sm text-muted-foreground">
              “{deleting?.name}” will be permanently deleted.
            </Dialog.Description>
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    await clientApi(
                      "/api/projects" +
                        (organizationId
                          ? "?organizationId=" + organizationId
                          : ""),
                      {
                        method: "DELETE",
                        body: JSON.stringify({ id: deleting?.id }),
                      },
                    );
                    setDeleting(null);
                    await load();
                    toast.success("Project deleted");
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
              >
                Delete permanently
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
