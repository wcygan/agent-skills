export function ProviderBanner({ mode }: { mode: "mock" | "live" }) {
  return (
    <div className="border-b border-blue-100 bg-blue-50 px-6 py-2 text-center text-xs text-accent">
      {mode === "mock"
        ? "Mock provider · Deterministic examples · No API key or provider charges"
        : "Live provider · Requests use your OpenRouter credits"}
    </div>
  );
}
