import { canManageProjects } from "@/modules/organizations/permissions";
import { describe, it, expect, vi } from "vitest";
import { projectSchema } from "@/modules/projects/schema";
import { envSchema } from "@/config/env";
import { presets } from "@/config/app";
import { validateFile } from "@/modules/storage/service";
import { sameOrigin, body } from "@/server/http";
vi.mock("@/modules/auth/session", () => ({ session: vi.fn() }));
describe("validation and boundaries", () => {
  it("trims names and rejects invalid projects", () => {
    expect(projectSchema.parse({ name: "  My project  " }).name).toBe(
      "My project",
    );
    expect(
      projectSchema.safeParse({ name: "x", status: "admin" }).success,
    ).toBe(false);
    expect(
      projectSchema.safeParse({ name: "ok", description: "x".repeat(2001) })
        .success,
    ).toBe(false);
  });
  it("requires a PostgreSQL URL and high-length auth secret", () => {
    expect(
      envSchema.safeParse({
        DATABASE_URL: "file:x",
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "x",
      }).success,
    ).toBe(false);
    expect(
      envSchema.safeParse({
        DATABASE_URL: "postgresql://localhost/app",
        BETTER_AUTH_SECRET: "a".repeat(48),
        BETTER_AUTH_URL: "http://localhost:3000",
      }).success,
    ).toBe(true);
  });
  it("defines honest, typed presets", () => {
    expect(presets.minimal.organizations).toBe(false);
    expect(presets.standard.billing).toBe(false);
    expect(presets.full.ai).toBe(true);
  });
  it("rejects unsupported and mismatched uploads", () => {
    expect(() => validateFile(Buffer.from("<svg>"), "image/svg+xml")).toThrow();
    expect(() => validateFile(Buffer.from("not a png"), "image/png")).toThrow();
    expect(() =>
      validateFile(Buffer.from("%PDF-1.7"), "application/pdf"),
    ).not.toThrow();
    expect(() =>
      validateFile(new Uint8Array(6 * 1024 * 1024), "image/png"),
    ).toThrow();
  });
  it("rejects missing and foreign origins", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://app.example.com");
    expect(() =>
      sameOrigin(
        new Request("https://app.example.com/api", {
          headers: { origin: "https://evil.example" },
        }),
      ),
    ).toThrow();
    expect(() =>
      sameOrigin(new Request("https://app.example.com/api")),
    ).toThrow();
    expect(() =>
      sameOrigin(
        new Request("https://app.example.com/api", {
          headers: { origin: "https://app.example.com" },
        }),
      ),
    ).not.toThrow();
    vi.unstubAllEnvs();
  });
  it("rejects oversized and invalid JSON bodies", async () => {
    await expect(
      body(
        new Request("http://localhost", {
          method: "POST",
          body: "x".repeat(33000),
        }),
        projectSchema,
      ),
    ).rejects.toThrow("large");
    await expect(
      body(
        new Request("http://localhost", { method: "POST", body: "{" }),
        projectSchema,
      ),
    ).rejects.toThrow("JSON");
  });
});

it("recognizes composite roles without granting members write access", () => {
  expect(canManageProjects("owner,admin")).toBe(true);
  expect(canManageProjects("member")).toBe(false);
  expect(canManageProjects("admin")).toBe(true);
});
