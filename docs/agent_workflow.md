# Agent Workflow

This project uses a lightweight agent workflow.

## Status Updates

Update `docs/project_status.md` when:

- the current goal changes
- meaningful progress is made
- a blocker appears or is resolved
- the next action changes
- work is paused and should be resumable later

Keep updates short. Do not create extra planning documents unless the user asks.

## Commit Check

Before committing:

1. Run `git status --short`.
2. Review the relevant diff.
3. Check whether `docs/project_status.md` should be updated.
4. Stage only files related to the current work.
5. Do not include unrelated files, secrets, large generated files, or local-only artifacts.

Do not push unless the user explicitly asks.

## Handoff

Before pausing or handing off work:

1. Update `docs/project_status.md`.
2. Record current state, blocker, and next action.
3. Mention checks that were run or still need to run.
