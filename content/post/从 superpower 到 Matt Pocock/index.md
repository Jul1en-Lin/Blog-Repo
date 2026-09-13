+++
title = "从 superpower 到 Matt Pocock"
slug = "从-superpower-到-Matt-Pocock"
date = "2026-08-06T20:25:41+08:00"
lastmod = "2026-08-07T01:17:02+08:00"
draft = false
description = "记录从 Superpowers 调整到 Matt Pocock skills 的原因，对比两套工作流的使用方式，并整理 Matt Pocock 的主要 skill。"
categories = ["AI"]
tags = ["AI", "Codex", "Superpowers", "Matt Pocock", "工作流"]
obsidian_path = "/AI/从 superpower 到 Matt Pocock"
+++
# 从 superpower 到 Matt Pocock

这次调整的起点很简单：Superpowers 的方法很好，但 `using-superpowers` 把它放在了所有对话的第一步，特别是在 claude code 中，开始任何对话都要加载这个 skill，即使我是问他一个非常简单的问题...

## Superpower

Superpowers  非常严谨，真的是从构思到上线，都给你安排好了一套完整的开发流程：

```text
需求或想法
  -> brainstorming
  -> writing-plans
  -> 实现、测试、审查
  -> verification-before-completion
  -> finishing-a-development-branch
```

其中 `brainstorming` 会先问清目标、约束和方案，再把设计写入文档，得到确认后才进入 `writing-plans`。后面还有 TDD、系统化排障、代码审查、worktree、并行 Agent 等专门步骤。

这种顺序适合需求还模糊、改动较大、需要留下设计依据的任务。它的价值是把常见遗漏提前变成检查点：先理解现状，再决定方案；先验证问题，再改代码；在宣称完成前给出证据。

但日常使用里，就显得非常繁琐了 :(

## Matt Pocock 介绍

Matt Pocock 的 skills 走另一条路：不设对话开始时的总入口，直接把 skill 分成两类。

一类是主动调用的 slash command 命令，例如 `grill-me`、`to-spec`、`to-tickets`、`implement`、`handoff`、`writing-great-skills`。它们通常对应一段明确的协作动作：把一个想法问透、把想法写成规格、拆成任务、开始实现、交接上下文。

其他的技能例如 `diagnosing-bugs`、`tdd`、`prototype`、`research`、`code-review`、`resolving-merge-conflicts`，只在合适的时候在 Matt 工作流中被调用，平时开发只需要注重主动调用的 slash command 即可

在 Claude Code 里，可以用下面的形式手动调用：

```text
/mattpocock-skills:grill-me <你的想法>
/mattpocock-skills:writing-great-skills <要编写或修改的 skill>
```

Matt 写的比较严格，大部分 skill 都有 disable-model-invocation 标志，想用得主动调 slash command，只要你不主动调用就不会加载进上下文。

## skill 列表

官方的入口不少，大致可以按任务形态理解：

- **`grill-me`：** 不依赖项目目录的追问会话，用来把一个想法或方案问清楚。
- **`grill-with-docs`：** 有代码仓库时使用的追问会话，同时维护 `CONTEXT.md`、ADR 和领域术语。比 `grill-me` 多了一条可接续的项目记忆。
- **`to-spec`：** 根据已讨论的内容和仓库现状写规格，确认测试边界，再发布到 issue tracker，标成 `ready-for-agent`。
- **`to-tickets`：** 把规格拆成可以独立推进的 tickets，明确依赖关系，适合跨多次会话的实现。
- **`implement`：** 依据规格或 tickets 实现；尽量走 `tdd`，过程中跑类型检查和局部测试，结束前跑 `code-review` 并提交。
- **`handoff`：** 把当前会话整理成可供下一位 Agent 接手的文档，避免复述已有的规格、提交和 diff，并过滤敏感信息。
- **`wayfinder`：** 面对超过单次会话容量的大方向，先在 issue tracker 里画出“决策地图”。每个 ticket 先回答一个决策问题，路线清楚后再进入实现。
- **`triage`：** 把 issue 或外部 PR 依次分类、核验、补信息，最后形成可交给 Agent 的任务简报。

两者没有高下之分，区别在于默认姿势。Superpowers 希望把流程变成纪律；Matt 希望让流程在需要时出现。

下期出一个 Matt Pocock 的工作流的使用教程～
