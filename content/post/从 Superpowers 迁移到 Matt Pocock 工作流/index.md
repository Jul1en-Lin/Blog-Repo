+++
title = "从 Superpowers 迁移到 Matt Pocock 工作流：一次缓慢的换挡"
slug = "从-Superpowers-迁移到-Matt-Pocock-工作流"
date = "2026-08-06T20:25:41+08:00"
lastmod = "2026-08-06T20:25:41+08:00"
draft = false
description = "比较 Superpowers 与 Matt Pocock skills 的调用方式，记录从全局入口迁移到按需调用的工作流调整，以及两套方法各自适合的场景。"
categories = ["AI"]
tags = ["AI", "Codex", "Superpowers", "Matt Pocock", "工作流"]
obsidian_path = "/Blog/工作流更新，从 superpower 到 Matt Pocock"
+++
# 从 Superpowers 迁移到 Matt Pocock 工作流：一次缓慢的换挡

四个月前我把 Superpowers v6.1.1 装进了 Codex。它是一个完整软件开发流程的 skill 套装：brainstorming 问清需求，writing-plans 拆解计划，systematic-debugging 处理异常，verification-before-completion 收尾。每一段对话的开头还要先过一遍「是否有适用的 skill」，哪怕只是问一个概念。

这套约束在某些时候很有价值。但用久了之后，我开始感觉每次打开对话都像要先穿上一整套盔甲。

## 让人不舒服的地方

Superpowers 的核心是 `using-superpowers`，一个全局入口 skill。它的设计意图很直接：只要有 1% 可能存在适用的 skill，就必须先调用它；任何回复或操作之前都要检查。

这是设计，不是 bug。但它有一个默认前提：每件事都值得先进入这条流程。

现实是，我每天的对话里有很多这样的时刻：

- 问一个 API 的参数叫什么
- 让 Codex 帮忙看一段报错
- 解释我想做什么，希望被追问几个问题
- 随手改一行配置

这些对话不需要先问「我应该走 brainstorming 还是 systematic-debugging」。但 `using-superpowers` 不管这些，它只管先检查。

更准确地说，问题出在「强制入口」，而不是「强制」本身。它把「可能需要工作流」和「每次都先进入工作流」混在了一起。对于开发、排障、长期任务，这种检查能减少跳步；但对于聊天、解释、一次性的判断，它让每轮对话多了一层固定仪式。

## 对比 Matt Pocock 的设计

大约在那段时间，我开始看 Matt Pocock 的 skills。

两者的基本思路完全不同：

Superpowers 像一条完整的软件开发流水线，强调步骤顺序、失败基线、验证证据和交接时机。每个 skill 都有明确的触发条件，但一旦进入，全局入口会几乎接管整个工作方式。

Matt 的设计则是另一条路：不设对话开始时的总入口，直接把 skill 分成两类。

**用户主动调用的技能**：grill-me、to-spec、to-tickets、implement、handoff。这些对应一段明确的协作动作，由你决定什么时候开始。比如「使用 grill-me，把这个想法问透，不要开始实现」。

**模型可按任务内容调用的技能**：diagnosing-bugs、tdd、prototype、research、code-review。这些更像在适当时机可拿起的工具，不需要你先穿流程的外套。

两者最明显的差别在于「谁能调用」。Matt 在每个 skill 的 front matter 里写了 `disable-model-invocation: true`，这意味着模型看不到该 skill 的描述，也不能自行选中它；只有用户输入对应的 slash command 后，skill 正文才会进入当前任务的上下文。平常不调用，就不占上下文。

Superpowers 把决定权交给模型，换来更高的流程覆盖率；Matt 把决定权放回用户，换来更少的常驻信息。

## 日常使用时，我分别借用了什么

这不代表我要整套替换。两者各有适合的场景。

Superpowers 的价值在复杂工程任务里依然清晰：需求还说不清楚时，需要 brainstorming 把问题问透；改动跨多个模块时，需要 writing-plans 留下可检查的计划；测试失败或行为反常时，需要 systematic-debugging 避免凭感觉修；要写高风险、会反复使用的 skill，需要 writing-skills 的验证方式。

Matt 的 skills 则更适合日常对话中的显式协作：

- 方案不清楚的时候，用 **grill-me** 把一个想法追问清楚。
- 复杂 bug 或性能问题，用 **diagnosing-bugs** 先做能复现的反馈回路。
- 有清晰接口、值得做回归保障的改动，用 **tdd** 先确认测试边界。
- 交互或视觉方向需要先看实物，用 **prototype** 做可运行的方案。
- 重要改动合并前，用 **code-review** 走一遍。
- 长任务换线程或暂停，用 **handoff** 整理交接文档。

有些 skill 我暂时不装：setup-matt-pocock-skills 会为每个仓库配 issue tracker、标签和 ADR 布局，只有真正想按 tickets 管理长期工程时才用；wayfinder 适合比单次会话还大的方向，但它假定以 issue tracker 作为主记录，这和我的「任务线程 + checkpoint + memory + review」体系有重叠。

## 实际迁移过程

操作比想象中简单。

Matt 的 skills 通过一行命令安装：

```bash
npx skills@latest add mattpocock/skills
```

`setup-matt-pocock-skills` 不是终端命令，它是一个 agent skill，安装完成后在对话里直接说「使用 setup-matt-pocock-skills，为这个仓库初始化」才会调用。

Superpowers 的处理方式是「禁用但不删除」。我把它们移到了 Codex 的禁用目录，文件完整保留，只是 Codex 扫描不到，不会出现在 skill 列表。需要时可以移回去。

迁移之后，最明显的变化在于对话的感觉：普通聊天不再需要先穿流程的外套，需要纪律的时候又能随时叫出对应的 skill 来。

没有全局入口后，模型会不会漏掉该用的流程？这需要观察一段时间。如果经常漏，就把触发语句写进 `AGENTS.md` 或直接在 prompt 里点名；偶尔才需要的话，就保持手动调用。规则应该帮助判断，不应替代判断。

---

这篇也是用 Codex 写的。如果你也在用 Superpowers，建议先从移除全局入口开始试试：保留方法，移除默认入口。两种工作流并不对立，只是不适合用同一套默认姿势同时跑。
