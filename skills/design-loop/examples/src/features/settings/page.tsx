import { useRef, useState } from "react";
import { useWorkspace } from "../../app/workspace-provider";
import { Button, PageHeading } from "../../components/workspace-ui";
import { command } from "../../shared/workspace";
import { defaultModel, models } from "../../shared/models";

const providers = [
  { name: "OpenAI", key: "openai" },
  { name: "OpenRouter", key: "openrouter" },
];

function ProviderIcon({ name }: { name: string }) {
  return (
    <img
      width="20"
      height="20"
      src={`/providers/${name.toLowerCase()}.png`}
      alt=""
    />
  );
}

export function SettingsPage() {
  const { state, act, pending } = useWorkspace();
  const [section, setSection] = useState("AI provider");
  const [connecting, setConnecting] = useState("");
  const menu = useRef<HTMLDetailsElement>(null);

  const preference = (key: string, fallback: string) =>
    state.preferences.find((p) => p.key === key)?.value ?? fallback;

  const save = (id: string, value: string) =>
    act(command("preference", { id, value }), "Preference saved.");

  const provider = preference("provider", "OpenAI");
  const connected = preference(provider.toLowerCase(), "false") === "true";
  const selectedModel = models.find((model) => model.id === preference("model", "")) ?? defaultModel;

  return (
    <>
      <PageHeading
        title="Settings"
        description="Your providers and notification preferences."
      />
      <div className="settings-layout">
        <nav aria-label="Settings sections">
          {["AI provider", "Notifications"].map((s) => (
            <Button
              key={s}
              aria-pressed={s === section}
              onClick={() => setSection(s)}
            >
              {s}
            </Button>
          ))}
        </nav>
        <div>
          {section === "AI provider" ? (
            <>
              <h2>Connected accounts</h2>
              <p className="help">
                OAuth sign-in is simulated. The workspace agent uses the
                server’s mock/live configuration, not these demo connections.
              </p>
              {providers.map((p) => (
                <div className="setting-row" key={p.key}>
                  <div className="provider-name">
                    <ProviderIcon name={p.name} />
                    <div>
                      <strong>{p.name}</strong>
                      <p>
                        {preference(p.key, "false") === "true"
                          ? "Demo account connected"
                          : "Connect to choose this provider’s models"}
                      </p>
                    </div>
                  </div>
                  <Button
                    disabled={pending}
                    onClick={() =>
                      preference(p.key, "false") === "true"
                        ? void save(p.key, "false")
                        : setConnecting(p.name)
                    }
                  >
                    {preference(p.key, "false") === "true"
                      ? "Disconnect"
                      : "Sign in with OAuth"}
                  </Button>
                </div>
              ))}
              {connecting ? (
                <div className="callout">
                  <h3>Connect {connecting}</h3>
                  <p>
                    This creates a local demo connection. No credentials or
                    OAuth request are sent.
                  </p>
                  <div className="actions">
                    <Button onClick={() => setConnecting("")}>Cancel</Button>
                    <Button
                      disabled={pending}
                      onClick={async () => {
                        if (await save(connecting.toLowerCase(), "true"))
                          setConnecting("");
                      }}
                    >
                      Connect demo account
                    </Button>
                  </div>
                </div>
              ) : null}
              <h2 className="section-title">Model preferences</h2>
              <div className="setting-row">
                <div>
                  <strong>Default model</strong>
                  <p>Provider first, then the model.</p>
                </div>
                <details ref={menu} className="model-picker">
                  <summary>
                    <ProviderIcon name={provider} />
                    <span>
                      {provider}
                      <small>{selectedModel.name}</small>
                    </span>
                    <span aria-hidden="true">⌄</span>
                  </summary>
                  <div className="model-menu">
                    {providers.map((p) => (
                      <div key={p.key}>
                        <h3>
                          <ProviderIcon name={p.name} />
                          {p.name}
                        </h3>
                        {models.map((model) => (
                          <Button
                            key={model.id}
                            disabled={
                              pending || preference(p.key, "false") !== "true"
                            }
                            aria-pressed={
                              provider === p.name &&
                              selectedModel.id === model.id
                            }
                            onClick={async () => {
                              if (await save("provider", p.name))
                                await save("model", model.id);

                              if (menu.current) {
                                menu.current.open = false;
                                menu.current.querySelector("summary")?.focus();
                              }
                            }}
                          >
                            {model.name}
                          </Button>
                        ))}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
              <div className="setting-row">
                <div>
                  <strong id="fast-label">Fast mode</strong>
                  <p id="fast-description">
                    Favor speed when the selected model supports it.
                  </p>
                </div>
                <input
                  type="checkbox"
                  role="switch"
                  aria-labelledby="fast-label"
                  aria-describedby="fast-description"
                  disabled={pending || !connected}
                  aria-checked={preference("fast", "true") === "true"}
                  checked={preference("fast", "true") === "true"}
                  onChange={(e) => void save("fast", String(e.target.checked))}
                />
              </div>
              <div className="setting-row">
                <div>
                  <label htmlFor="effort">Effort level</label>
                  <p>How much reasoning to request.</p>
                </div>
                <select
                  id="effort"
                  disabled={pending || !connected}
                  value={preference("effort", "low")}
                  onChange={(e) => void save("effort", e.target.value)}
                >
                  <option>low</option>
                  <option>medium</option>
                  <option>high</option>
                </select>
              </div>
              {!connected ? (
                <p className="help">
                  Connect the selected provider to edit model preferences.
                </p>
              ) : null}
            </>
          ) : (
            <>
              <h2>Notifications</h2>
              {[
                {
                  id: "mentions",
                  title: "Replies and mentions",
                  text: "Show activity on the conversations you follow.",
                },
                {
                  id: "email",
                  title: "Email delivery",
                  text: "Include notifications in a daily summary. Delivery is simulated.",
                },
              ].map((setting) => (
                <div key={setting.id} className="setting-row">
                  <div>
                    <strong id={`${setting.id}-label`}>{setting.title}</strong>
                    <p id={`${setting.id}-description`}>{setting.text}</p>
                  </div>
                  <input
                    type="checkbox"
                    role="switch"
                    aria-labelledby={`${setting.id}-label`}
                    aria-describedby={`${setting.id}-description`}
                    aria-checked={preference(setting.id, "true") === "true"}
                    checked={preference(setting.id, "true") === "true"}
                    disabled={pending}
                    onChange={(e) =>
                      void save(setting.id, String(e.target.checked))
                    }
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
