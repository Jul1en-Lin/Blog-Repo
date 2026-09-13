+++
title = "Matt Pocock Skills"
slug = "Matt-Pocock-Skills"
date = "2026-08-14T10:00:00+08:00"
lastmod = "2026-08-14T10:00:00+08:00"
draft = false
description = "Matt Pocock 的 Skills 是一套给 coding agent 使用的工程工作流，本篇整理了整套 skills 的分类、主干流程以及每个 skill 的用途。"
categories = ["AI"]
tags = ["AI", "Codex", "Matt Pocock", "Skills", "工作流"]
obsidian_path = "/AI/Matt Pocock Skills"
+++
# Matt Pocock Skills

一切教程与观点都来自本人的实战体验与 Matt 的官方 skill 介绍和直播讲解，欢迎交流讨论！

> 来源：[AI Skills for Real Engineers](https://www.aihero.dev/skills)

Matt Pocock 的 Skills 是一套给 coding agent 使用的工程工作流。每个 skill 都是边界清楚，大部分都要手动调用 slash command 才能触发，根据实际场景来动态调整。而且 Matt 的思想是将问题先经过不断的挖掘，然后变成 `spec` 文档，确定好前进方向后，将问题拆分成多个 issue，然后 issue 中有可能包含多个非常简单的子 issue。以 `ticket` 来划分任务的颗粒度，把一个大问题拆分为多个 ticket。ticket 中就安排了怎么做，再通过 `/implement` 来完成 ticket。

<mark class="hltr-green-light">Matt 建议每个 ticket 的解决窗口大小都不要超过 150 k 左右，100 k 以内都是模型的聪明区，所以在实现每个 ticket 时都建议让模型“implement tickets one by one”，即不要一次性解决完全部 ticket，最好一个窗口解决一个 ticket；或者能在聪明区的范围内，按照任务的复杂度可以一次性解决多个 ticket。但都不宜过多😼</mark>

## 说明书

`ask-matt` 可以理解成是这套 skills 的说明书。你可以描述自己现在遇到的情境，例如一个不知道怎么开始的想法、一批别人提交的 bug，或一段已经持续很久的 session，它会告诉你该使用哪个 skill，或者按什么顺序使用一组 skills，同时标出流程中需要人做决定的地方。

它维护在当前项目中已经整理好的 skills ，不主动扫描你本机安装了什么，所以也不会替你安排自己的 skills 或其他作者的 skills。

## 01 Getting Started

先做一次对此次 Matt 工作流做必要的一系列设置

- **`/setup-matt-pocock-skills`：** 为一个 repo 做一次设置，让其它 skills 知道这个项目如何组织、使用什么工具，以及工作约定是什么。

## 02 The Main Flow

这是从 `idea` 到 `ship` 的主干流程，按顺序展开。

1. `/grill-with-docs`： 通过提问把计划说清楚，并把已经做出的决定记录下来。它和 `/grill-me` 的区别是它更适合项目本身已经存在的仓库，`/grill-me` 是在项目雏形塑造，还没有建仓库时适合的头脑风暴（初次之外，`/wayfinder` 也适合做前期的决策工作，它里面已经内置了 `/grill-me` 等 skill，更加适合大型项目的开发方向决策）
2. **`/to-spec`：** 把已经达成共识的讨论整理成一份书面 spec。
3. `/to-tickets`：把 spec 拆成 agent 可以分别处理的小 tickets。可以让他在本地或者 GitHub issue 上整理 ticket，交给新窗口进行实现
4. `/implement`：依据已经确认的 ticket 来实现，这是主要写代码的环节，实现每个 ticket 时都建议让模型“implement tickets one by one”，且最好每个解决 ticket 的上下文窗口保持在 150k 左右。
5. `/code-review`：tickets 完成后，对照项目自己的标准和原始探讨出来的 spec，检查看有没有出现开发方向错误的情况。审查最好新开会话来实现，因为模型会对自己写的代码有种自信，让它自测可能会假设漏掉一些条件，切到新窗口后会更好。

这条主干里有两个分支：当某个设计问题需要运行代码才能回答时，可以先绕到 `/prototype`；当任务会跨越多个 session 时，就需要把 spec 拆成 tickets，具体的就是执行 `/to spec` 后再执行 `/to-tickets`。

## 03 Shaping

探索一个尚未确定的问题，产出可以送回主流程的决定或答案。

- `/wayfinder`：把一个规模很大的项目工作整理成决策地图，带你回答一些关键问题，确定大致的开发前进路线
- `/prototype`：用一段之后会删除的代码回答设计问题，让可运行的结果帮助你做决定。
- **`/research`：** 从 primary sources 中读取资料，给出带引用的答案。

## 04 Upkeep

保持 codebase 和 issue list 处于可工作的状态，同时为主流程产生新的工作。

- **`/improve-codebase-architecture`：** 找出值得重构的模块，并用一份可视化报告说明原因和方向。
- `/diagnosing-bugs`：从一个可复现的失败案例开始，定位比较棘手的 bug。
- **`/resolving-merge-conflicts`：** 处理 merge 或 rebase 冲突，直到冲突完成。
- **`/triage`：** 把原始 issue 整理成别人可以接手的工作项。
- **`/wizard`：** 生成一个脚本，引导人完成只有人能完成的设置步骤。

## 05 Productivity Skills

面向人的工作流，主要处理协作、交接和学习，不以写代码为中心。

- **`/grill-me`：** 在真正投入一个想法之前，通过追问把双方的理解对齐。
- **`/handoff`：** 把一次很长的 session 整理成文档，让另一个 agent 可以继续工作。
- **`/to-questionnaire`：** 把尚未回答的问题整理成一份文档，由其他人补充答案。
- **`/teach`：** 把一个主题拆成多次 session 学习，每次都建立在前一次的结果上。
- **`/wait-what`：** 让 agent 用 plain English 把刚才的内容重新说一遍。
- **`/writing-for-agents`：** 说明如何编写 skills，以及其它会被 agent 读取的文档。

## 06 Reference Skills

其它 skills 可以调用或引用的可复用知识层。

- **`/codebase-design`：** 提供设计 deep modules 时使用的词汇和思考方式。
- **`/domain-modeling`：** 把项目正在使用的词语磨准，并把它们记录下来。
- **`/grilling`：** 其它 skills 用来压力测试计划的一套访谈方法。
- **`/tdd`：** `red-green-refactor` 循环所遵循的规则。

若想看实战，Matt 本人也发布了几个从零构建的实战项目，里面详细介绍了他是如何使用它的 skill，还解答了直播间的各种问题，很值得一看！

[Mattpocock Skills 原作者的手把手教程](https://x.com/mattpocockuk/status/2075218406266036236)
[从零搭建一个全新项目——2 小时从想法到完整架构设计](https://www.youtube.com/watch?v=K-mA3MZ_EzU)

## 相关阅读

- [从 superpower 到 Matt Pocock]({{< relref "/post/从 superpower 到 Matt Pocock/" >}})