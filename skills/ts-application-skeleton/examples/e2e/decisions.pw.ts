import { expect, test } from "@playwright/test";

const journeys = [
  {
    slug: "ranking",
    title: "Ranking playground",
    scenario: "A reading app roadmap",
    result: "One assessment. Your priorities.",
  },
  {
    slug: "evidence",
    title: "Evidence checker",
    scenario: "Real quote, wrong claim",
    result: "Contradicted by the source",
  },
  {
    slug: "actions",
    title: "Request → typed action",
    scenario: "Dim the lights",
    result: "Action ready to preview",
  },
  {
    slug: "skills",
    title: "Skill finder",
    scenario: "Fix failing CI",
    result: "Suggested: gh-fix-ci",
  },
  {
    slug: "extraction",
    title: "Pick the right value",
    scenario: "Total due",
    result: "Selected $1,315.50",
  },
];

for (const journey of journeys) {
  test(`${journey.title} supports navigation, execution, and direct reload`, async ({
    page,
  }) => {
    await page.goto("/decisions");
    await page.getByRole("link", { name: new RegExp(journey.title) }).click();
    await expect(page).toHaveURL(new RegExp(`/decisions/${journey.slug}$`));
    await page.reload();
    await expect(
      page.getByRole("heading", { name: journey.title, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: new RegExp(journey.scenario) })
      .click();
    await expect(
      page.getByRole("heading", { name: journey.result, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Simulated judgments", { exact: false }),
    ).toBeVisible();
    await page.getByText("Inspect input and typed judgments").click();
    await expect(
      page.getByText("Judgments / code checks", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "All decision demos" }).click();
    await expect(
      page.getByRole("heading", { name: "Small judgments. Useful software." }),
    ).toBeVisible();
  });
}

test("ranking sliders reorder without requesting new judgments", async ({
  page,
}) => {
  await page.goto("/decisions/ranking");
  await page.getByRole("button", { name: /A reading app roadmap/ }).click();
  await expect(
    page.getByRole("heading", { name: "One assessment. Your priorities." }),
  ).toBeVisible();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.getByRole("slider", { name: "Customer impact" }).fill("0");
  await page.getByRole("slider", { name: "Strategic fit" }).fill("0");
  await page.getByRole("slider", { name: "Ease of delivery" }).fill("100");
  await expect(
    page
      .getByRole("list", { name: "Ranked features" })
      .getByRole("listitem")
      .first(),
  ).toContainText("Color themes");
  await expect(page.getByTestId("request-count")).toHaveText(
    "1 provider request",
  );
  expect(requests).toEqual([]);
  await page.getByRole("slider", { name: "Ease of delivery" }).fill("0");
  await expect(page.getByText(/All weights are zero/)).toBeVisible();
});

test("failure to find evidence or a suitable skill is a visible outcome", async ({
  page,
}) => {
  await page.goto("/decisions/evidence");
  await page.getByRole("button", { name: /Missing quote/ }).click();
  await expect(
    page.getByRole("heading", { name: "Quote not found" }),
  ).toBeVisible();
  await expect(page.getByTestId("request-count")).toHaveText(
    "0 provider requests",
  );
  await page.getByRole("button", { name: /Needs a closer look/ }).click();
  await expect(
    page.getByRole("heading", { name: "Human review suggested" }),
  ).toBeVisible();
  await page.goto("/decisions/skills");
  await page.getByRole("button", { name: /Reject the shortlist/ }).click();
  await expect(
    page.getByRole("heading", { name: "No suitable skill" }),
  ).toBeVisible();
  await expect(page.getByTestId("request-count")).toHaveText(
    "2 provider requests",
  );
});

test("demo directory and results fit a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/decisions");
  await expect(
    page.getByRole("link", { name: /Ticket assessment/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/decisions-directory-mobile.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: /Ranking playground/ }).click();
  await page.getByRole("button", { name: /A reading app roadmap/ }).click();
  await expect(
    page.getByRole("heading", { name: "One assessment. Your priorities." }),
  ).toBeVisible();
  await page.getByText("Inspect input and typed judgments").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/decisions-ranking-mobile.png",
    fullPage: true,
  });
});

test("result colors follow typed outcomes and selected source values", async ({
  page,
}) => {
  await page.goto("/decisions/evidence");
  await page.getByRole("button", { name: /Real quote, wrong claim/ }).click();
  await expect(page.getByTestId("outcome")).toHaveAttribute("data-tone", "red");
  await expect(page.locator("mark")).toHaveAttribute("data-tone", "red");
  await page.getByRole("button", { name: /Needs a closer look/ }).click();
  await expect(page.getByTestId("outcome")).toHaveAttribute(
    "data-tone",
    "amber",
  );
  await page.getByRole("button", { name: /Missing quote/ }).click();
  await expect(page.getByTestId("outcome")).toHaveAttribute(
    "data-tone",
    "neutral",
  );
  await page.goto("/decisions/extraction");
  await page.getByRole("button", { name: /Total due/ }).click();
  await expect(page.locator('mark[data-tone="green"]')).toHaveText("$1,315.50");
  await expect(page.locator('article[data-tone="green"]')).toContainText(
    "131550 USD cents",
  );
  await page.getByRole("button", { name: /Missing amount/ }).click();
  await expect(
    page.getByRole("heading", { name: "No value selected" }),
  ).toBeVisible();
  await expect(page.locator('mark[data-tone="green"]')).toHaveCount(0);
  await expect(page.locator('article[data-tone="green"]')).toHaveCount(0);
});

test("colored action fields and skill selection remain labeled", async ({
  page,
}) => {
  await page.goto("/decisions/actions");
  await page.getByRole("button", { name: /Cool the bedroom/ }).click();
  const fields = page.getByRole("definition");
  await expect(fields).toHaveText(["Set temperature", "bedroom", "19°C"]);
  await page.getByRole("button", { name: /An unclear request/ }).click();
  await expect(
    page.getByRole("heading", { name: "Clarification needed" }),
  ).toBeVisible();
  await expect(fields).toHaveCount(0);
  await page.goto("/decisions/skills");
  await page.getByRole("button", { name: /Fix failing CI/ }).click();
  await expect(page.locator('article[data-tone="green"]')).toContainText(
    "gh-fix-ci",
  );
  await expect(
    page.getByRole("list", { name: "Selection stages" }),
  ).toContainText("3 candidates shortlisted");
});

test("all demos have readable color keys on desktop and mobile", async ({
  page,
}) => {
  const cases = [
    ["tickets", "Checkout outage", "Priority review"],
    ["ranking", "A reading app roadmap", "One assessment. Your priorities."],
    ["evidence", "Real quote, wrong claim", "Contradicted by the source"],
    ["actions", "Cool the bedroom", "Action ready to preview"],
    ["skills", "Fix failing CI", "Suggested: gh-fix-ci"],
    ["extraction", "Total due", "Selected $1,315.50"],
  ];

  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/decisions");
    await page.screenshot({
      path: `/tmp/decision-colors-directory-${width}.png`,
      fullPage: true,
    });

    for (const [slug, scenario, heading] of cases) {
      await page.goto(`/decisions/${slug}`);
      await page.getByRole("button", { name: new RegExp(scenario) }).click();
      await expect(
        page.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      await expect(page.getByLabel("Color key")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/decision-colors-${slug}-${width}.png`,
        fullPage: true,
      });
    }
  }
});

test("uncertain skill and extraction results request review without selecting a candidate", async ({ page }) => {
  for (const [slug, scenario, heading] of [
    ["skills", "An uncertain match", "Review the skill match"],
    ["extraction", "An unclear amount", "Review the amount"],
  ]) {
    await page.goto(`/decisions/${slug}`);
    await page.getByRole("button", { name: new RegExp(scenario) }).click();
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByTestId("outcome")).toHaveAttribute("data-tone", "amber");
    await expect(page.locator('article[data-tone="green"]')).toHaveCount(0);
    await expect(page.locator('mark[data-tone="green"]')).toHaveCount(0);
  }
});
