---
name: rex-workflow
description: "Run projects efficiently in Rex (Superlogical's terminal multiplexer): one session per project, several agents working in parallel, noticing when an agent needs the human, one-command project layouts, event-driven automation, controlling Rex apps, and an always-on Rex host. Use when planning or improving how work is organized in Rex, setting up a project workspace, or deciding how agents and humans share Rex. Keywords: rex, superlogical, session, pane, block, parallel agents, activity, notifications, program status, rex do, rex.on, init.lua, custom action, remote host, community MCP"
license: MIT
compatibility: Requires the rex CLI and Rex's own `rex` skill (installed by `rex skill setup`) for command mechanics. Rex is in beta; verify flags with `rex COMMAND --help`.
metadata:
  author: William Cygan
  version: "0.1.0"
---

# Run projects with Rex

Rex's own `rex` skill teaches the CLI: targeting panes, running commands,
reading output, cleaning up. This skill covers how to organize work so a human
and several agents get the most out of Rex. Load both when acting in Rex.

Terms: a **session** is a project workspace, a **window** is a tab, a **block**
is a pane. One Rex server owns sessions; apps on each device are clients.

## 1. One session per project

- Create a session per project or task (`rex new NAME`) and keep everything for
  that work inside it: agents, dev servers, tests, logs.
- Name sessions after the work in two to four hyphenated words. Rex's skill
  tells agents to rename their session for the task; expect labels to change.
- Put long-lived processes in their own tabs (`rex window new -s S NAME -- CMD`)
  and short checks in splits beside the agent (`rex split -s S -b B --split=below`).
- Background work should not steal focus: pass `--focus=false`. Keep output a
  human should read with `--keep-open`.
- After a server restart Rex restores sessions, tabs, pane layouts and labels
  with a fresh shell in each pane. Running programs and scrollback are lost, so
  record how to restart a pane's program (a custom action, below).

## 2. Several agents in parallel

- Run one agent per pane. Agents in the same session share the project
  directory, so give them non-overlapping work, or separate git worktrees for
  edits that could collide.
- Phrase requests relative to the agent's own pane: "run the tests beside you",
  "start the dev server in another tab and tell me when it's listening",
  "close what you opened". An explicit session, tab or pane name always wins
  over the agent's own location.
- Agents started inside Rex get `REX_SESSION` and `REX_BLOCK`; hooks from
  `rex skill setup` (Claude Code, Codex) also announce them at session start.
  Pi and OpenCode get the skill but no hook.
- Start agents from a Rex pane, not plain SSH. On macOS, SSH sessions cannot
  read the login Keychain, so agent and `gh` credentials appear missing there.
- Sandboxed agents need network access to reach the Rex server socket. Codex's
  default sandbox blocks it; `[sandbox_workspace_write] network_access = true`
  keeps the sandbox while allowing Rex.

## 3. Know when an agent needs you

- Programs report state with the program status protocol (OSC 7501): idle,
  working, blocked on the user, finished, failed. Rex shows it in the app's
  **Activity** sidebar (`client.sidebar.activity.toggle`) and can notify
  (Settings → Notifications) on each device, including a phone.
- Read a pane's reported state: `rex block call -s S -b B program_status`.
  Claude Code reports `app=claude-code` (verified 2026-10-30). Check Codex, Pi
  and other tools the same way before relying on their status.
- For commands rather than agents: `rex wait -s S BLOCK --for 30s --json` waits
  for a pane to end; `rex block call -s S -b B process` shows whether it is
  still running and its `last_exit`. A wait timeout says nothing about success.
- Long-running scripts can emit OSC 7501 themselves (see
  `build/program-status.md` in the docs) so they show up beside agents.

## 4. One-command project setup

- Define layouts as custom actions in `init.lua` with `rex.action{...}` and
  `rex.layout.horizontal/vertical/block`. Bind them with `rex.bind` and they
  also appear in the command palette.
- Typical project layout: agent pane, a tab for the dev server, a tab or split
  for tests, a split for logs. Set `cwd` per block and `command` for long-lived
  programs; use `exit = { on_completion = false }` to keep finished output.
- Validate with `rex config check`, apply with `rex config reload` (Rex does not
  watch the file). APIs that act for a client do not run at load time, only
  inside an action's `run`.
- One-off setups that should not live in config: write a Lua script and run it
  with `rex do setup.lua`.

## 5. Automation

- `rex do script.lua` runs Lua against a server with the full client API:
  inspect, create sessions and windows, start terminals, read screens.
- A script can stay running and react with `rex.on(event, fn)`: a terminal
  changes directory, a program exits, a window closes, a session is created.
  Event handlers work in `rex do` scripts, not in `init.lua`.
- From the shell: `rex events -s S --json` streams events; combine with
  `rex wait` for "start this, wait, then do that" pipelines.
- Good first automations: label panes by directory, notify when a long command
  exits, restart a dev server that dies, close panes an agent opened when its
  task ends.

## 6. Control Rex apps

- With Remote Control on in an app, agents can drive that device's app:
  `rex -C CLIENT do session.select session_id=S`, `client.tab.goto index=2`,
  `client.font.increase`. List clients with `rex client ls` and their actions
  with `rex -C CLIENT actions`.
- Use it to hand results to the human: open the diff or test output in a tab
  and bring that session forward on their device.
- Some actions are only available in context (Switch Host appears only once the
  app knows a second host); `rex -C CLIENT do NAME` reports unavailable actions.

## 7. An always-on Rex host

- Run the Rex server on an always-on machine; laptops and phones become clients.
  The app's built-in Tailscale gives the server its own tailnet device;
  `rex hosts add LABEL URL` saves it for `rex -S LABEL`, and `rex home set URL`
  makes it the home whose hosts and shortcuts every device follows.
- Any connection can do everything the server's account can. Keep "limit access
  to your Tailscale account" on and never use `--allow-anonymous`.
- Devices signed in as the same Tailscale user are indistinguishable to Rex:
  an agent on the host can reach any other Rex server you expose on the tailnet,
  such as a laptop's. Decide deliberately which machines serve Rex over
  Tailscale.
- Unattended recovery (power loss, login, Tailscale, Rex at login) is a host OS
  concern; document and test it per host.

## 8. Docs and Community MCP

- Docs index: `https://www.superlogical.com/rex/docs/llms.txt`; append `.md` to
  any page; search with `.../rex/docs/search.json?q=...`.
- Rex docs, changelog and Rex Beta Discord discussions are an MCP server at
  `https://www.superlogical.com/rex/community-mcp`, read-only, OAuth via Discord
  for members. Use it for behavior the docs do not cover yet.

## Done well

The human can see every agent's state at a glance, opens a project in one
command, never has to ask an agent where its output went, and can close the
laptop while work continues on the host.
