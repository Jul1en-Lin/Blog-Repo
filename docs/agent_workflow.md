# Agent Workflow

This project uses a setup-light workflow: enough context for the next agent, without turning docs into a diary.

## Daily Entry

- `AGENTS.md`: repo rules and agent instructions.
- `docs/project_status.md`: current snapshot, open blocker, and handoff note.
- `docs/agent_workflow.md`: this process guide.
- `docs/archive/`: historical material. Read it only when history matters.

## Status Updates

Update `docs/project_status.md` only when the next agent would need the information:

- the current goal, branch, or working area changes
- a blocker appears or is resolved
- the next action changes and the work will continue later
- a check result affects what should happen next
- the user gives a durable constraint that is not already in `AGENTS.md`
- work spans multiple turns, days, branches, or agents

Do not update `docs/project_status.md` for:

- typo fixes, copy edits, image swaps, or one-file polish that finishes in the same turn
- small content imports where the final reply and commit message are enough
- routine test results that do not affect future work
- details already captured better in a commit message, PR body, or archived note

Keep updates short. Do not create architecture, planning, spec, decision, changelog, or bug-report files unless the user asks.

## Commit Check

Before committing:

1. Run `git status --short`.
2. Review the relevant diff.
3. Decide whether `docs/project_status.md` actually needs an update. Default to no for finished same-turn edits.
4. Stage only files related to the current work.
5. Do not include unrelated files, secrets, large generated files, or local-only artifacts.

Do not push unless the user explicitly asks.

## Handoff

Before pausing or handing off work:

1. Update `docs/project_status.md`.
2. Record current state, blocker, and next action.
3. Mention checks that were run or still need to run.
