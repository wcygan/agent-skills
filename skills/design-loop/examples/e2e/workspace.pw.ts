import { expect, test } from "@playwright/test";

test("connected workspace: approval gate, production action, tickets, feed, settings, agent", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Load sample workspace" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Deployments" })
    .click();
  await expect(
    page.getByRole("button", { name: "Deploy to production" }).first(),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Request production approval" }).click();
  await page.getByRole("button", { name: "Add sample checklist" }).click();
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await page.getByRole("link", { name: /Promote v1.8.0/ }).click();
  await expect(
    page.getByRole("link", { name: "Discuss with agent" }),
  ).toHaveAttribute("href", /agent\?context=/);
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("Reviewer");
  await page.getByRole("button", { name: "Request changes" }).click();
  await expect(page.getByText("Explain what needs to change.")).toBeVisible();
  await page
    .getByRole("textbox", { name: "Reviewer note" })
    .fill("Add the rollback owner.");
  await page.getByRole("button", { name: "Request changes" }).click();
  await page.getByRole("link", { name: "Revise and resubmit" }).click();
  await page
    .getByRole("textbox", { name: "Rollout and rollback plan" })
    .fill(
      "Maya owns rollback. Watch error rate and restore the previous artifact on regression.",
    );
  await page.getByRole("button", { name: "Review request" }).click();
  await page.getByRole("button", { name: "Submit for approval" }).click();
  await page
    .getByRole("link", { name: /Promote v1.8.0/ })
    .first()
    .click();
  await page
    .getByRole("combobox", { name: "Demo role" })
    .selectOption("Reviewer");
  await page.getByRole("button", { name: "Approve artifact" }).click();
  await page.getByRole("link", { name: "Open deployment" }).click();
  await page.getByRole("button", { name: "Deploy to production" }).click();
  await expect(
    page.getByText(
      "This version is published to production in the local simulation.",
    ),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(
      "This version is published to production in the local simulation.",
    ),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Tickets" })
    .click();
  await page.getByRole("searchbox", { name: "Search tickets" }).fill("mobile");
  await page.getByRole("link", { name: /Verify mobile navigation/ }).click();
  await page
    .getByRole("combobox", { name: "Status", exact: true })
    .selectOption("Done");
  await expect(page.getByRole("status")).toContainText(
    "Ticket status updated.",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Team feed" })
    .click();
  await page
    .getByRole("textbox", { name: "Share a goal or progress update" })
    .fill("The console release is complete.");
  await page.getByRole("button", { name: "Post update" }).click();
  await expect(
    page.getByText("The console release is complete.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Settings" })
    .click();
  const modelPicker = page.locator(".model-picker > summary");

  await expect(modelPicker).toContainText("GPT 6.1 Sol");
  await expect(page.getByRole("switch", { name: "Fast mode" })).toBeChecked();
  await expect(page.getByRole("combobox", { name: "Effort level" })).toHaveValue("low");
  await page.getByRole("button", { name: "Sign in with OAuth" }).first().click();
  await page.getByRole("button", { name: "Connect demo account" }).click();
  await modelPicker.click();
  await expect(page.locator(".model-menu").getByRole("button")).toHaveText([
    "GPT 6 Luna", "GPT 6.1 Sol", "GPT 6 Luna", "GPT 6.1 Sol",
  ]);
  await page.getByRole("button", { name: "GPT 6 Luna", exact: true }).first().click();
  await expect(modelPicker).toContainText("GPT 6 Luna");
  await page.reload();
  await expect(modelPicker).toContainText("GPT 6 Luna");

  await page
    .getByRole("button", { name: "Notifications", exact: true })
    .click();
  const toggle = page.getByRole("switch", { name: "Email delivery" });
  await expect(toggle).toBeChecked();
  await page
    .getByText(
      "Include notifications in a daily summary. Delivery is simulated.",
    )
    .click();
  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await page.getByRole("link", { name: "Agent", exact: true }).click();
  await page.getByRole("button", { name: "Production blockers" }).click();
  await expect(page.getByText(/Local workspace analysis/)).toBeVisible();
});

test("all routes retain the header and mobile access", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const route of [
    "/",
    "/tickets",
    "/deployments",
    "/approvals",
    "/feed",
    "/settings",
    "/about",
    "/agent",
  ]) {
    await page.goto(route);
    const open = page.getByRole("button", { name: "Open navigation" });

    await expect(open).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeHidden();
    await open.click();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(open).toBeFocused();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );

    expect(overflow).toBe(false);
  }

  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Agent", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Ask the workspace agent" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/agent/);
});

test("mobile drawer contains focus, dismisses, navigates, and adapts to desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/agent");

  const open = page.getByRole("button", { name: "Open navigation" });
  const drawer = page.getByRole("dialog", { name: "Main menu" });
  const close = drawer.getByRole("button", { name: "Close navigation" });
  const settings = drawer.getByRole("link", { name: "Settings" });

  await open.click();
  await expect(drawer).toBeVisible();
  await expect(open).toHaveAttribute("aria-expanded", "true");
  await expect(close).toBeFocused();
  await expect(drawer.getByRole("link", { name: "Agent", exact: true }))
    .toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  await close.press("Shift+Tab");
  await expect(settings).toBeFocused();
  await settings.press("Tab");
  await expect(close).toBeFocused();
  await close.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(open).toBeFocused();
  await expect(open).toHaveAttribute("aria-expanded", "false");
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");

  await open.click();
  await drawer.getByRole("button", { name: "Dismiss navigation" })
    .click({ position: { x: 382, y: 200 } });
  await expect(drawer).toBeHidden();
  await expect(open).toBeFocused();

  await page.setViewportSize({ width: 320, height: 568 });
  await open.click();
  await expect(settings).toBeInViewport({ ratio: 1 });
  await settings.click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(drawer).toBeHidden();

  await open.click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(drawer).toBeHidden();
  await expect(open).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("record links open a focused agent discussion", async ({ page }) => {
  await page.goto("/deployments?release=rel-api");
  await page.getByRole("link", { name: "Discuss with agent" }).click();
  await expect(page).toHaveURL(/\/agent\?context=/);
  await expect(
    page.getByRole("link", { name: "Open related record" }),
  ).toHaveAttribute("href", "/deployments?release=rel-api");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/Local workspace analysis/)).toBeVisible();
  await expect(page.locator(".agent-message.assistant")).not.toContainText(
    "Customer console",
  );
  await page.goto("/tickets?ticket=FRM-103");
  await page.getByRole("link", { name: "Discuss with agent" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/Owner:/)).toBeVisible();
});

test("agent keeps the composer reachable and supports keyboard chat", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 800 },
    { width: 783, height: 726 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/agent?context=%2Fdeployments%3Frelease%3Drel-api");
    await expect(page.locator(".agent-context")).toHaveCount(0);
    await expect(page.locator(".agent-header p")).toHaveCount(0);
    await expect(page.locator(".agent-input label")).toHaveCount(0);
    const send = page.getByRole("button", { name: "Send message" });
    await expect(send).toBeInViewport({ ratio: 1 });
    expect(
      await page.evaluate(() => ({
        horizontal: document.documentElement.scrollWidth > innerWidth,
        vertical: document.documentElement.scrollHeight > innerHeight,
      })),
    ).toEqual({ horizontal: false, vertical: false });
  }

  const draft = page.getByRole("textbox", { name: "Ask the workspace agent" });
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(draft).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await draft.fill("What is blocking production?");
  await draft.press("Shift+Enter");
  await expect(draft).toHaveValue("What is blocking production?\n");
  await expect(page.locator(".agent-message")).toHaveCount(0);
  await draft.press("Enter");
  await expect(page.locator(".agent-message.assistant")).toContainText(
    "Local workspace analysis",
  );
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeInViewport({ ratio: 1 });
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.locator(".agent-message")).toHaveCount(0);
  await expect(draft).toHaveValue("");
  await page.getByRole("button", { name: "Production blockers" }).click();
  await expect(page.locator(".agent-message.user")).toContainText(
    "What is blocking production?",
  );
  await expect(page.locator(".agent-message.assistant")).toBeVisible();
  await expect(draft).toBeFocused();

  await page.route("**/*", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await draft.fill("Explain the approval process");
  await draft.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Your draft is restored");
  await expect(draft).toHaveValue("Explain the approval process");
  await expect(draft).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeInViewport({ ratio: 1 });
});
