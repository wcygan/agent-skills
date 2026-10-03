import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "../../app/workspace-provider";
import {
  Button,
  PageHeading,
  Empty,
  Status,
} from "../../components/workspace-ui";
import { command } from "../../shared/workspace";

export function TicketsPage({ selectedId }: { selectedId?: string }) {
  const { state, act, pending } = useWorkspace();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All active");
  const [selection, setSelection] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appId, setAppId] = useState("");
  const [error, setError] = useState("");

  const tickets = state.tickets.filter(
    (t) =>
      (filter === "All active"
        ? t.status !== "Archived"
        : t.status === filter) &&
      `${t.id} ${t.title} ${t.owner}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const ticket = state.tickets.find((t) => t.id === selectedId);

  async function bulkDone() {
    for (const item of tickets)
      if (selection.includes(item.id)) {
        if (
          !(await act(
            command("ticket-update", {
              id: item.id,
              value: "Done",
              version: item.version,
            }),
            "Tickets updated.",
          ))
        )
          break;
      }

    setSelection([]);
  }

  return (
    <>
      <PageHeading
        title="Tickets"
        description="The roadmap, organized by work and ownership."
        actions={
          <Button className="primary" onClick={() => setCreateOpen(true)}>
            New ticket
          </Button>
        }
      />
      {createOpen ? (
        <form
          className="panel form-panel"
          onSubmit={async (e) => {
            e.preventDefault();

            if (!title.trim()) {
              setError("Enter a ticket title.");

              return;
            }

            if (
              await act(
                command("ticket-create", {
                  id: `FRM-${crypto.randomUUID().slice(0, 8)}`,
                  value: title,
                  note: description,
                  related: appId || state.apps[0]?.id || "",
                }),
                "Ticket created.",
              )
            ) {
              setCreateOpen(false);
              setTitle("");
              setDescription("");
              setError("");
            }
          }}
        >
          <h2>New roadmap ticket</h2>
          <label htmlFor="ticket-title">Title</label>
          <input
            id="ticket-title"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label htmlFor="ticket-description">Description</label>
          <textarea
            id="ticket-description"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor="ticket-app">Application</label>
          <select
            id="ticket-app"
            value={appId || state.apps[0]?.id || ""}
            onChange={(e) => setAppId(e.target.value)}
          >
            {state.apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {error ? <p role="alert">{error}</p> : null}
          <div className="actions">
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              className="primary"
              disabled={pending || !state.apps.length}
            >
              Create ticket
            </Button>
          </div>
        </form>
      ) : null}
      <div className="toolbar">
        <label className="sr-only" htmlFor="ticket-search">
          Search tickets
        </label>
        <input
          id="ticket-search"
          type="search"
          value={search}
          placeholder="Search tickets…"
          onChange={(e) => {
            setSearch(e.target.value);
            setSelection([]);
          }}
        />
        <label className="sr-only" htmlFor="ticket-filter">
          Status filter
        </label>
        <select
          id="ticket-filter"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelection([]);
          }}
        >
          {["All active", "Todo", "In progress", "Done", "Archived"].map(
            (s) => (
              <option key={s}>{s}</option>
            ),
          )}
        </select>
        <span>{tickets.length} tickets</span>
      </div>
      {selection.length ? (
        <div className="bulk">
          {selection.length} selected
          <Button disabled={pending} onClick={() => void bulkDone()}>
            Mark done
          </Button>
          <Button onClick={() => setSelection([])}>Clear selection</Button>
        </div>
      ) : null}
      <div className="table-wrap">
        <table>
          <caption className="sr-only">Roadmap tickets</caption>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select visible tickets"
                  checked={
                    tickets.length > 0 &&
                    tickets.every((t) => selection.includes(t.id))
                  }
                  onChange={(e) =>
                    setSelection(
                      e.target.checked ? tickets.map((t) => t.id) : [],
                    )
                  }
                />
              </th>
              <th>Ticket</th>
              <th>Status</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>
                  <span id={`ticket-select-${t.id}`} className="sr-only">
                    Select {t.id}
                  </span>
                  <input
                    type="checkbox"
                    aria-labelledby={`ticket-select-${t.id}`}
                    checked={selection.includes(t.id)}
                    onChange={(e) =>
                      setSelection((ids) =>
                        e.target.checked
                          ? [...ids, t.id]
                          : ids.filter((id) => id !== t.id),
                      )
                    }
                  />
                </td>
                <td>
                  <Link
                    to="/tickets"
                    search={{ ticket: t.id }}
                    aria-label={`${t.id} ${t.title}`}
                  >
                    <strong>{t.title}</strong>
                    <small>
                      {t.id} · {state.apps.find((a) => a.id === t.appId)?.name}
                    </small>
                  </Link>
                </td>
                <td>
                  <Status>{t.status}</Status>
                </td>
                <td>{t.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!tickets.length ? (
        <Empty title="No matching tickets">
          <Button
            onClick={() => {
              setSearch("");
              setFilter("All active");
            }}
          >
            Clear filters
          </Button>
        </Empty>
      ) : null}
      {selectedId ? (
        ticket ? (
          <section className="panel detail-panel" aria-label="Ticket details">
            <div className="section-heading">
              <h2>{ticket.title}</h2>
              <Link to="/tickets" aria-label="Close ticket details">
                ×
              </Link>
            </div>
            <p>{ticket.description}</p>
            <label htmlFor="ticket-status">Status</label>
            <select
              id="ticket-status"
              value={ticket.status}
              disabled={pending}
              onChange={(e) =>
                void act(
                  command("ticket-update", {
                    id: ticket.id,
                    version: ticket.version,
                    value: e.target.value,
                  }),
                  "Ticket status updated.",
                )
              }
            >
              {["Todo", "In progress", "Done", "Archived"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="related-links">
              <Link
                className="button"
                to="/agent"
                search={{
                  context: `/tickets?ticket=${encodeURIComponent(ticket.id)}`,
                }}
              >
                Discuss with agent ↗
              </Link>
              {state.releases.flatMap((r) =>
                r.ticketIds.includes(ticket.id)
                  ? [
                      <Link
                        to="/deployments"
                        search={{ release: r.id }}
                        key={r.id}
                      >
                        {r.version} deployment →
                      </Link>,
                    ]
                  : [],
              )}
            </div>
            <Button
              disabled={pending}
              onClick={() =>
                void act(
                  command("ticket-archive", {
                    id: ticket.id,
                    version: ticket.version,
                  }),
                  "Ticket archive state updated.",
                )
              }
            >
              {ticket.status === "Archived"
                ? "Restore ticket"
                : "Archive ticket"}
            </Button>
          </section>
        ) : (
          <Empty title="Ticket not found">
            <Link to="/tickets">Back to roadmap</Link>
          </Empty>
        )
      ) : null}
    </>
  );
}
