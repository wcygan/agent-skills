---
name: rex-workflow
description: "Organize project work in Rex, Superlogical's terminal multiplexer. Use for project sessions, parallel agents, activity and notifications, reusable layouts, Lua automation, remote app control, or an always-on Rex host."
license: MIT
compatibility: Requires the Rex CLI. Use Rex's own skill, installed by `rex skill setup`, for command mechanics and `rex COMMAND --help` for current flags.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Run projects with Rex

Give each project a named session (`rex new NAME`). Keep long-lived processes
in windows (tabs) and short checks in blocks (panes) beside the agent. Use
`--focus=false` for background work and `--keep-open` for output someone needs
to read. A server restart restores the layout with fresh shells. Record how
to relaunch programs and retain any output needed beyond that restart.

### Parallel agents and status

- Use one agent per block for independently owned files or worktrees, or for
  bounded reads that can proceed independently. Each brief names the goal,
  write scope, result location and expected evidence. Agents share the project
  directory unless you assign separate worktrees.
- Pane-local requests use `REX_SESSION` and `REX_BLOCK`. Prefer an explicit
  target when acting elsewhere. Start agents in Rex panes on macOS so their
  tools can use the login Keychain. If the Codex sandbox blocks a pane check,
  use an existing authorized connection to the same session when available.
  Otherwise report the failed command and the access error.
- Activity and notifications use OSC 7501. Confirm each agent reports status
  with `rex block call -s S -b B program_status` before relying on it. For a
  terminal command, use `rex wait -s S B --for 30s --json` and inspect
  `rex block call -s S -b B process` for running state or `last_exit` if the
  wait times out.

### Layouts, automation and app control

- Save reusable layouts as `rex.action{...}` in `init.lua` with
  `rex.layout.horizontal/vertical/block` and optional `rex.bind`. Set `cwd`
  and `command` on each applicable block, and use
  `exit = { on_completion = false }` to retain finished output. Client
  actions run inside an action's `run`. Apply changes with
  `rex config check` then `rex config reload`.
- Use `rex do setup.lua` for one-off setup and `rex.on(event, fn)` inside
  `rex do` scripts for reactive automation. For shell pipelines use
  `rex events -s S --json` or `rex wait`.
- With Remote Control enabled on the target app, find it with `rex client ls`
  and list available actions with `rex -C CLIENT actions`. Bring a result
  forward with `rex -C CLIENT do session.select session_id=S`.

### Codex sandbox setup

When the user asks to enable workspace-write networking for Rex, set
`network_access = true` in `[sandbox_workspace_write]` and verify the Rex
connection. This grants network access to the whole workspace-write sandbox.

### Always-on host

For work that must survive closing the laptop, run the Rex server on an
always-on machine and connect from other devices. Use `rex hosts add LABEL URL`
and `rex -S LABEL`. Use `rex home set URL` if devices should follow that
server's hosts and shortcuts. A Rex connection has the server account's
authority. Keep Tailscale account restrictions enabled, avoid
`--allow-anonymous`, and account for agents reaching any Rex servers exposed
to the same Tailscale user. Test unattended host recovery separately from
reconnecting a client.

Verify the selected workflow in Rex. For a reusable layout, launch it and
confirm the placement and commands. For parallel work, check that the human
can find results and tell whether an agent needs input. For a remote host,
reconnect from another device and confirm the session is still running.

Use the [Rex docs index](https://www.superlogical.com/rex/docs/llms.txt) for Lua
APIs and the [Community MCP](https://www.superlogical.com/rex/community-mcp)
(read-only, Discord OAuth for members) for beta behavior the docs omit.
