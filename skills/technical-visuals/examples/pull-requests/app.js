const metadata = {
  cache: {
    title: "fix: load the record when the cache misses",
    scope: "3 fictional files · +84 −21",
  },
  retry: {
    title: "fix: preserve form inputs when saving fails",
    scope: "3 fictional files · +96 −34",
  },
  queue: {
    title: "fix: reject new jobs when the queue is full",
    scope: "4 fictional files · +142 −48",
  },
};
let selected = "cache";
function select(key) {
  selected = key;
  const example = window.prExamples[key];
  document.getElementById("pr-title").textContent = metadata[key].title;
  document.getElementById("scope").textContent = metadata[key].scope;
  document.getElementById("pr-body").innerHTML = example.html.replace(
    /^<h1>.*?<\/h1>\s*/,
    "",
  );
  document.getElementById("template").textContent = example.markdown;
  document.getElementById("asset").href = `assets/${key}.svg`;
  document
    .querySelectorAll("[data-example]")
    .forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.example === key),
      ),
    );
}

let theme = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
function setTheme() {
  for (const [key, value] of Object.entries(window.visualTokens[theme]))
    document.documentElement.style.setProperty(`--${key}`, value);
  document.documentElement.style.colorScheme = theme;
  document.getElementById("theme").textContent = theme === "dark" ? "☀" : "☾";
  document
    .getElementById("theme")
    .setAttribute(
      "aria-label",
      `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
    );
}
document.getElementById("theme").addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  setTheme();
});
document
  .querySelectorAll("[data-example]")
  .forEach((button) =>
    button.addEventListener("click", () => select(button.dataset.example)),
  );

function download() {
  const url = URL.createObjectURL(
    new Blob([window.prExamples[selected].markdown], {
      type: "text/markdown;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${selected}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.getElementById("download").addEventListener("click", download);
document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.prExamples[selected].markdown);
    document.getElementById("copy-status").textContent = "Markdown copied.";
  } catch {
    download();
    document.getElementById("copy-status").textContent =
      "Clipboard unavailable. Downloaded the Markdown file.";
  }
});
setTheme();
select("cache");
