import type { Metadata } from "next";
import { appConfig } from "@/config/app";
import { Providers } from "@/components/shared/providers";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: { default: appConfig.name, template: `%s · ${appConfig.name}` },
  description: appConfig.description,
  icons: { icon: appConfig.favicon },
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    type: "website",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{ "--app-font": appConfig.theme.font } as React.CSSProperties}
      >
        <a className="sr-only focus:not-sr-only" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
