export default function Loading() {
  return (
    <div role="status" className="animate-pulse space-y-5">
      <span className="sr-only">Loading workspace</span>
      <div className="h-9 w-64 rounded bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}
