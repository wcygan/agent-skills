import { expect, test } from "@playwright/test";

test("collection CRUD validates titles, persists reloads, and rejects stale edits", async ({
  page,
  context,
}) => {
  await page.goto("/collections");
  await expect(page.getByText("No collection items yet.")).toBeVisible();
  await page.getByRole("button", { name: "New collection item" }).click();
  await page.getByRole("button", { name: "Save item" }).click();
  await expect(page.getByRole("alert")).toHaveText("Enter a title between 1 and 120 characters.");
  await page.getByLabel("Title", { exact: true }).fill("Browser collection");
  await page.getByRole("button", { name: "Save item" }).click();
  await expect(
    page.getByRole("heading", { name: "Browser collection", exact: true }),
  ).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Browser collection", exact: true }),
  ).toBeVisible();

  const stale = await context.newPage();
  await stale.goto(url);
  await stale.getByRole("button", { name: "Edit item", exact: true }).click();
  await page.getByRole("button", { name: "Edit item", exact: true }).click();
  await page.getByLabel("Title", { exact: true }).fill("Updated collection");
  await page.getByRole("button", { name: "Save item" }).click();
  await expect(
    page.getByRole("heading", { name: "Updated collection", exact: true }),
  ).toBeVisible();
  await stale.getByLabel("Title", { exact: true }).fill("Stale edit");
  await stale.getByRole("button", { name: "Save item" }).click();
  await expect(stale.getByRole("alert")).toContainText("This item changed or was deleted");
  await stale.getByRole("button", { name: "Reload latest item" }).click();
  await expect(
    stale.getByRole("heading", { name: "Updated collection", exact: true }),
  ).toBeVisible();
  await stale.close();

  await page.getByRole("button", { name: "Edit item", exact: true }).click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByText("No collection items yet.")).toBeVisible();
  await page.goto(url);
  await expect(page.getByRole("heading", { name: "Collection item not found" })).toBeVisible();
});

test("failed save keeps the draft and retry submits only once", async ({ page }) => {
  await page.goto("/collections");
  await page.getByRole("button", { name: "New collection item" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Retry collection");
  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST") await route.abort();
    else await route.continue();
  });
  await page.getByRole("button", { name: "Save item" }).click();
  await expect(page.getByRole("alert")).toContainText("Could not save");
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Retry collection");
  await page.unroute("**/*");
  let submissions = 0;
  let release: () => void = () => {};

  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });

  await page.route("**/*", async (route) => {
    if (route.request().method() === "POST") {
      submissions++;
      await barrier;
    }

    await route.continue();
  });
  await page.getByRole("button", { name: "Save item" }).click();
  await expect(page.getByRole("button", { name: "Working…" })).toBeDisabled();
  // A second submit event must be ignored even before the pending render.
  await page
    .locator("form")
    .evaluate((form) =>
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
    );
  release();
  await expect(page.getByRole("heading", { name: "Retry collection", exact: true })).toBeVisible();
  expect(submissions).toBe(1);
  await page.unroute("**/*");
  await page.getByRole("button", { name: "Edit item", exact: true }).click();
  await page.getByRole("button", { name: "Delete item", exact: true }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByText("No collection items yet.")).toBeVisible();
});

test("route failure can recover without reloading the browser", async ({ page }) => {
  await page.goto("/");
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() === "fetch") await route.abort();
    else await route.continue();
  });
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Collections" })
    .click();
  await expect(page.getByRole("heading", { name: "Could not load this page" })).toBeVisible();
  await page.unroute("**/*");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: "Collections", exact: true })).toBeVisible();
});
