import { expect, test } from "@playwright/test";

test("overview links reach each demo and decisions can be reassessed", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Explore decisions/ }).click();
  await page.getByRole("link", { name: /Ticket assessment/ }).click();
  await expect(page.getByRole("heading", { name: "A different message. A different next step." })).toBeVisible();
  await page.getByRole("button", { name: /Checkout outage/ }).click();
  await expect(page.getByRole("heading", { name: "Priority review" })).toBeVisible();
  await page.getByRole("button", { name: /An invoice request/ }).click();
  await expect(page.getByRole("heading", { name: "Standard queue" })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Overview" }).click();
  await page.getByRole("link", { name: /Open agent/ }).click();
  await expect(page.getByRole("heading", { name: "Pi, your thinking partner" })).toBeVisible();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Overview" }).click();
  await page.getByRole("link", { name: /Browse collections/ }).click();
  await expect(page.getByRole("heading", { name: "Collections", exact: true })).toBeVisible();
});

test("chat suggestions, responses, and reset retain their behavior", async ({ page }) => {
  await page.goto("/pi-agent");
  await page.getByRole("button", { name: /Make a concept click/ }).click();
  await expect(page.getByRole("textbox", { name: "Message Pi" })).toHaveValue(/coffee shop/);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("button", { name: "Copy response" })).toBeVisible();
  await page.getByRole("button", { name: /New chat/ }).click();
  await expect(page.getByRole("heading", { name: "What’s on your mind?" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Pi" })).toBeEmpty();
});
