"use client";
import { appConfig } from "@/config/app";
import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={appConfig.theme.default}
      enableSystem
    >
      <>
        {children}
        <Toaster richColors />
      </>
    </ThemeProvider>
  );
}
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunMoon size={18} />
    </Button>
  );
}
