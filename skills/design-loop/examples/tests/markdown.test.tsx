import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "../src/components/prompt-kit/markdown";

test("Markdown renders structured replies and complete-document reference links", () => {
  const html = renderToStaticMarkup(
    <Markdown>
      {
        "## Example\n\n**Useful** steps:\n\n1. Read\n2. Write\n\n```ts\nconst x = 1\n```\n\n[Docs][docs]\n\n[docs]: https://example.com"
      }
    </Markdown>,
  );

  expect(html).toContain("<h2>Example</h2>");
  expect(html).toContain("<strong>Useful</strong>");
  expect(html).toContain("<ol>");
  expect(html).toContain('class="language-ts"');
  expect(html).toContain('href="https://example.com"');
});

test("model Markdown cannot execute HTML, unsafe links, or remote image requests", () => {
  const html = renderToStaticMarkup(
    <Markdown>
      {
        "<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)\n\n![tracking](https://tracker.invalid/pixel)\n\n<img src=x onerror=alert(1)>"
      }
    </Markdown>,
  );

  expect(html).not.toContain("<script");
  expect(html).not.toContain("javascript:");
  expect(html).not.toContain("<img");
  expect(html).not.toContain("tracker.invalid");
  expect(html).toContain("[Image: tracking]");
});
