"use client";
import { useState } from "react";
import {
  Accordion,
  Tabs,
  Tooltip,
  DropdownMenu,
  Dialog,
  Popover,
  Switch,
  Checkbox,
  Progress,
} from "radix-ui";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, Badge } from "@/components/ui/card";
import { DataTable } from "@/components/data-display/data-table";
import { UsageChart } from "@/components/data-display/usage-chart";
const examples = [
  {
    title: "Buttons",
    code: 'import { Button } from "@/components/ui/button";\n<Button variant="outline">Save</Button>',
    preview: (
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success("Action completed")}>
          Primary
        </Button>
        <Button variant="outline">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button disabled>Disabled</Button>
      </div>
    ),
  },
  {
    title: "Fields and inputs",
    code: 'import { Field, FieldLabel } from "@/components/ui/field";\nimport { Input } from "@/components/ui/input";\n<Field><FieldLabel htmlFor="name">Name</FieldLabel><Input id="name" /></Field>',
    preview: (
      <div className="max-w-sm space-y-4">
        <Field>
          <FieldLabel htmlFor="gallery-name">Project name</FieldLabel>
          <Input id="gallery-name" placeholder="Your next idea" />
        </Field>
        <Textarea
          aria-label="Description example"
          placeholder="A little more detail"
        />
        <label className="flex items-center gap-3 text-sm">
          <Checkbox.Root
            className="size-5 rounded border border-border"
            aria-label="Accept terms"
          >
            <Checkbox.Indicator>✓</Checkbox.Indicator>
          </Checkbox.Root>
          Accept terms
        </label>
        <label className="flex items-center gap-3 text-sm">
          <Switch.Root
            aria-label="Enable notifications"
            className="h-6 w-10 rounded-full bg-muted data-[state=checked]:bg-primary"
          >
            <Switch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-card transition-transform data-[state=checked]:translate-x-[18px]" />
          </Switch.Root>
          Notifications
        </label>
        <label className="block text-sm">
          Date <Input type="date" aria-label="Example date" />
        </label>
        <label className="block text-sm">
          Volume{" "}
          <input className="w-full" type="range" aria-label="Example volume" />
        </label>
      </div>
    ),
  },
  {
    title: "Feedback",
    code: 'import { toast } from "sonner";\ntoast.success("Saved");',
    preview: (
      <div className="space-y-4">
        <div
          role="status"
          className="rounded border border-border bg-muted p-4 text-sm"
        >
          Your changes have been saved.
        </div>
        <Progress.Root
          value={65}
          aria-label="Example progress"
          className="h-2 overflow-hidden rounded bg-muted"
        >
          <Progress.Indicator className="h-full w-[65%] bg-primary" />
        </Progress.Root>
        <Badge>Active</Badge>
        <div className="h-7 animate-pulse rounded bg-muted" />
        <Button onClick={() => toast.success("Saved successfully")}>
          Show toast
        </Button>
      </div>
    ),
  },
  {
    title: "Navigation and overlays",
    code: 'import { Dialog, Tabs, Accordion } from "radix-ui";\n// Compose accessible primitives with the shared Button and design tokens.',
    preview: (
      <div className="space-y-5">
        <Tabs.Root defaultValue="one">
          <Tabs.List className="flex gap-4 border-b border-border">
            <Tabs.Trigger
              className="p-2 data-[state=active]:border-b"
              value="one"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              className="p-2 data-[state=active]:border-b"
              value="two"
            >
              Activity
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="pt-4 text-sm" value="one">
            Your workspace overview.
          </Tabs.Content>
          <Tabs.Content className="pt-4 text-sm" value="two">
            Your latest activity.
          </Tabs.Content>
        </Tabs.Root>
        <Accordion.Root type="single" collapsible>
          <Accordion.Item value="one">
            <Accordion.Header>
              <Accordion.Trigger className="text-sm underline">
                How do I customize this?
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="pt-3 text-sm">
              Edit the shared CSS variables and app configuration.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
        <div className="flex flex-wrap gap-3">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="outline">Open dialog</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-80 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-card p-6">
                <Dialog.Title className="text-xl">
                  A little more context.
                </Dialog.Title>
                <Dialog.Description className="my-4 text-sm">
                  Focus stays here until you close the dialog.
                </Dialog.Description>
                <Dialog.Close asChild>
                  <Button>Done</Button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline">Actions ↓</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="rounded border border-border bg-card p-2">
                <DropdownMenu.Item
                  className="cursor-pointer rounded p-2 text-sm outline-none focus:bg-muted"
                  onSelect={() => toast.success("Selected")}
                >
                  Show notification
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button variant="outline">Details</Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="rounded border border-border bg-card p-4 text-sm">
                A small detail panel.
                <Popover.Arrow fill="var(--border)" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button variant="ghost">Hover or focus me</Button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content className="rounded bg-primary p-2 text-xs text-primary-foreground">
                  Helpful extra context.
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
      </div>
    ),
  },
  {
    title: "Sortable, searchable table",
    code: 'import { DataTable } from "@/components/data-display/data-table";\n<DataTable data={rows} columns={[{ accessorKey: "name", header: "Name" }]} />',
    preview: (
      <DataTable
        data={[
          { name: "Example Alpha", status: "Active" },
          { name: "Example Beta", status: "Paused" },
        ]}
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "status", header: "Status" },
        ]}
      />
    ),
  },
  {
    title: "Charts",
    code: 'import { UsageChart } from "@/components/data-display/usage-chart";\n<UsageChart data={[{ label: "Mon", value: 3 }]} />',
    preview: (
      <>
        <p className="mb-5 text-xs text-muted-foreground">
          Illustrative example data; not live analytics.
        </p>
        <UsageChart
          data={[
            { label: "Mon", value: 3 },
            { label: "Tue", value: 7 },
            { label: "Wed", value: 5 },
            { label: "Thu", value: 9 },
          ]}
        />
      </>
    ),
  },
];
export function ComponentGallery() {
  const [search, setSearch] = useState("");
  return (
    <>
      <Input
        className="mb-8 max-w-md"
        aria-label="Search components"
        placeholder="Search the building blocks…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {examples
          .filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))
          .map((e) => (
            <Card key={e.title}>
              <h2 className="mb-6 text-xl font-medium">{e.title}</h2>
              {e.preview}
              <details className="mt-6 border-t border-border pt-4">
                <summary className="text-xs text-muted-foreground">
                  Usage and imports
                </summary>
                <pre className="mt-4 overflow-auto rounded bg-muted p-4 text-xs">
                  {e.code}
                </pre>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(e.code);
                      toast.success("Copied");
                    } catch {
                      toast.error(
                        "Clipboard unavailable. Select and copy the sample.",
                      );
                    }
                  }}
                >
                  Copy example
                </Button>
              </details>
            </Card>
          ))}
      </div>
    </>
  );
}
