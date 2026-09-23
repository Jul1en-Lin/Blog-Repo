+++
title = "基于 Jev 的上下文压缩的 Pi 轻量插件"
slug = "基于-Jev-的上下文压缩的-Pi-轻量插件"
date = "2026-09-23T00:00:00+08:00"
lastmod = "2026-09-23T00:00:00+08:00"
draft = false
description = "介绍一个面向 Pi 的 Jev 压缩插件：在原生上下文压缩前评估历史工具调用，精简冗余内容，并在异常时安全回退。"
categories = ["AI"]
tags = ["Pi", "Jev", "TypeSafe", "上下文管理"]
obsidian_path = "/项目/基于 Jev 的上下文压缩的 Pi 轻量插件"
+++
# 基于 Jev 的上下文压缩的 Pi 轻量插件

## 背景与痛点

长会话里那些“食之无味”的历史工具输出

在使用 AI 进行较复杂的重构或排查任务时，都会遇到上下文过多压缩的情况。

在 Pi 中虽然有压缩命令，但我们可以看看它具体压缩了些什么。

如果你用 Pi 跑过时间稍长的任务，大概清楚那个感觉：上下文里堆着几十轮的工具输出，read 读了几百行源码的结果、bash 吐出来的长串依赖树、反复试错时留下的废弃命令……这些东西凑在一起，等到上下文快满、准备压缩时，它们依然原封不动地躺在那儿，等着被一口气扔进去做摘要。

问题是，把这些早就过期的内容全都喂给大模型，虽然模型可能从摘要里留下有效信息，但执行效率和准确性都会受影响。

所以我做了这个插件，想先在压缩前把真正没用的东西挑出来。把这些已经失去时效性的大段工具文本直接交给大模型做压缩摘要，不仅消耗大量总结时间和 token 成本，还可能因为无关噪音过多而稀释真正关键的上下文记忆。

## 解决思路

在原生压缩前，先来一次修剪。

借鉴 Tamara Tran 在 Claude Code 生态下的 fast-jev-compaction，我做了一个面向 Pi 的原生适配插件：[@lienat/pi-jev-compaction](https://github.com/Jul1en-Lin/pi-jev-compaction)。它只做原生压缩前的预处理：

```text
Pi 触发压缩（自动阈值或手动 /compact）
              ↓
触发 session_before_compact 扩展钩子
              ↓
Jev 秒级评估待摘要区间的工具调用与结果
    │
    ├─ 评估成功：精简冗余的工具调用并截短大文本结果
    │          ↓
    │       Pi 原生 compact() 生成结构化摘要与元数据
    │
    └─ 超时 / 异常 / 用户取消：原始消息数组保持不变
               ↓
            安全回退至 Pi 原生普通压缩
```

## 核心亮点

### 1. 只做减法

- **精准裁剪：**通过 TypeSafe Jev 模型快速判断历史工具调用应当保留、删除还是截短。
- **保护原生信息：**用户提示词、Assistant 思考过程（thinking blocks）、图片内容、近期保留消息以及不完整的工具对都不做修改。
- **只替换输入数组：**会话的 `firstKeptEntryId`、`fileOps` 文件操作追踪和分支元数据依然由 Pi 管理。

### 2. 安全回退

- 默认超时时限为 15 秒，可通过环境变量调节。
- 遇到网络波动、未配置 Key、请求超时或用户主动中断时，插件会跳过预处理，Pi 继续使用原生压缩。

## 30 秒安装

### 第一步：安装插件

通过 Pi 的包管理器安装：

```bash
pi install npm:@lienat/pi-jev-compaction
```

也可以直接从 GitHub 安装：

```bash
pi install git:github.com/Jul1en-Lin/pi-jev-compaction@main
```

### 第二步：配置 Jev API Key

插件使用 TypeSafe Jev 服务进行快速决策。在启动 Pi 的终端环境中配置环境变量：

```bash
export TYPESAFE_API_KEY='your-typesafe-key'
```

可选参数：

```bash
# 自定义单次 Jev 判定超时（毫秒），默认 15000（15 秒）
export PI_FAST_JEV_TIMEOUT_MS=15000
```

### 第三步：体验

重启 Pi 即可。无论上下文达到阈值后自动压缩，还是手动输入 `/compact`，控制台都会显示精简记录：

```text
[jev] 12 call(s) reviewed: dropped 8, shortened 2 · 850ms; Pi will create the native summary.
```

插件会先从待压缩上下文中移除冗余调用，再把信息密度更高的内容交给 Pi 原生压缩。

## 开源与致谢

- GitHub：[@lienat/pi-jev-compaction](https://github.com/Jul1en-Lin/pi-jev-compaction)
- 协议：MIT License
- 核心决策逻辑源自 Tamara Tran 的 fast-jev-compaction 及 aleksvega 的分支。

欢迎试用、提 Issue 或 Star 支持！
