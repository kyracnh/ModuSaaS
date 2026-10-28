import { test, expect } from "@playwright/test";
test("register, manage projects, update profile, and navigate responsively", async ({
  page,
}, info) => {
  const email = `browser-${info.project.name}-${crypto.randomUUID()}@example.com`;
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Less setup/ })).toBeVisible();
  await page.goto("/register");
  await page.getByLabel("Your name").fill("Browser Test");
  await page.getByLabel("Email address").fill(email);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Browser-Password-2026!");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/dashboard", { timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await page.goto("/dashboard/projects");
  await page.getByRole("button", { name: "New project", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Browser project");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A real persistent project");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(
    page.getByText("Browser project", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit Browser project" }).click();
  await page
    .getByLabel("Name", { exact: true })
    .fill("Updated browser project");
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(
    page.getByText("Updated browser project", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Updated browser project", { exact: true }),
  ).toBeVisible();
  await page.goto("/dashboard/settings");
  await page.getByLabel("Full name").fill("Updated Browser");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(
    page.getByText("Profile updated", { exact: true }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();
    await page.getByRole("button", { name: "Close navigation" }).click();
  }
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("class", /dark|light/);
  if (
    process.env.CAPTURE_SCREENSHOTS === "1" &&
    info.project.name === "chromium"
  ) {
    await page.goto("/dashboard");
    await page.screenshot({
      path: "docs/images/dashboard.png",
      fullPage: true,
    });
  }
  await page.goto("/dashboard/settings");
  await page
    .getByRole("button", { name: "Delete my account", exact: true })
    .click();
  await page
    .getByLabel("Confirm with your password")
    .fill("Browser-Password-2026!");
  await page
    .getByRole("button", { name: "Permanently delete account" })
    .click();
  await expect(page).toHaveURL("/");
});
test("login rejects incorrect credentials and dashboard redirects guests", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL("/login");
  await page.getByLabel("Email address").fill("missing@example.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("Incorrect-Password-2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
});
