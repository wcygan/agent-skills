import { createContext, use, useRef, useState, type ReactNode } from "react";
import { getWorkspace, mutateWorkspace } from "../server/functions/workspace";
import type { Command, Snapshot } from "../shared/workspace";

interface WorkspaceContext {
  state: Snapshot;
  pending: boolean;
  feedback: string;
  error: boolean;
  act: (input: Command, message: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

const Context = createContext<WorkspaceContext | null>(null);

export function useWorkspace() {
  const value = use(Context);

  if (!value) throw new Error("Workspace provider missing");

  return value;
}

export function WorkspaceProvider({
  initial,
  children,
}: {
  initial: Snapshot;
  children: ReactNode;
}) {
  const [state, setState] = useState(initial);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);
  const last = useRef<{ input: Command; message: string } | null>(null);
  const busy = useRef(false);

  async function act(input: Command, message: string) {
    if (busy.current) return false;
    busy.current = true;
    setPending(true);
    setError(false);
    last.current = { input, message };

    try {
      const result = await mutateWorkspace({ data: input });

      if (!result.ok) {
        setFeedback(result.message);
        setError(true);

        return false;
      }

      setState(result.value);
      setFeedback(message);
      last.current = null;

      return true;
    } catch {
      setFeedback(
        "Could not reach the server. Your input is preserved; retry or refresh the workspace.",
      );
      setError(true);

      return false;
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  async function refresh() {
    try {
      const result = await getWorkspace();

      if (result.ok) {
        setState(result.value);
        setError(false);
        setFeedback("Workspace refreshed.");
      } else {
        setFeedback(result.message);
        setError(true);
      }
    } catch {
      setFeedback("Could not refresh. Try again when the server is available.");
      setError(true);
    }
  }

  async function retry() {
    if (last.current) await act(last.current.input, last.current.message);
  }

  return (
    <Context value={{ state, pending, feedback, error, act, refresh, retry }}>
      {children}
    </Context>
  );
}
