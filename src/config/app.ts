export const presets = {
  minimal: {
    organizations: false,
    notifications: false,
    billing: false,
    ai: false,
    storage: false,
  },
  standard: {
    organizations: true,
    notifications: true,
    billing: false,
    ai: false,
    storage: false,
  },
  full: {
    organizations: true,
    notifications: true,
    billing: true,
    ai: true,
    storage: true,
  },
} as const;
export type Preset = keyof typeof presets;
const preset = (process.env.NEXT_PUBLIC_PRESET ?? "standard") as Preset;
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "ModuSaaS",
  description: "The foundation for your next great product.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  logo: "/logo.svg",
  favicon: "/favicon.svg",
  theme: {
    default: "system",
    accent: "neutral",
    font: "system-ui, sans-serif",
  },
  languages: ["en"],
  contact: "hello@example.com",
  footer: [
    { label: "Documentation", href: "/docs" },
    { label: "GitHub", href: "https://github.com/kyracnh/ModuSaaS" },
  ],
  features: presets[preset] ?? presets.standard,
  upload: {
    maxBytes: 5 * 1024 * 1024,
    types: ["image/png", "image/jpeg", "application/pdf"],
  },
  plans: {
    free: { name: "Free", projectLimit: 5, aiRequestsPerDay: 10 },
    pro: { name: "Pro", projectLimit: 100, aiRequestsPerDay: 100 },
  },
} as const;
export function navigation() {
  return [
    { label: "Overview", href: "/dashboard" },
    { label: "Projects", href: "/dashboard/projects" },
    ...(appConfig.features.organizations
      ? [{ label: "Workspace", href: "/dashboard/workspace" }]
      : []),
    ...(appConfig.features.ai
      ? [{ label: "AI studio", href: "/dashboard/ai" }]
      : []),
    ...(appConfig.features.billing
      ? [{ label: "Billing", href: "/dashboard/billing" }]
      : []),
    ...(appConfig.features.storage
      ? [{ label: "Files", href: "/dashboard/files" }]
      : []),
    ...(appConfig.features.notifications
      ? [{ label: "Notifications", href: "/dashboard/notifications" }]
      : []),
    { label: "Settings", href: "/dashboard/settings" },
  ];
}
