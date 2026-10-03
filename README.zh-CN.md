[English](README.md) | [简体中文](README.zh-CN.md)

# dsh-plugin-ASD-STE100-Karpathy

一个 DeepSeek Harness 插件兼 Agent 技能。让大模型用清晰、简洁的技术受控语言输出，参考航空航天 ASD-STE100 Issue 9 规范与 Andrej Karpathy 的输出阶梯思路。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard: ASD-STE100 Issue 9](https://img.shields.io/badge/Standard-ASD--STE100%20Issue%209-informational.svg)](https://www.asd-ste100.org)
[![CI Status](https://img.shields.io/github/actions/workflow/status/antti0403/dsh-plugin-ASD-STE100-Karpathy/ci.yml?branch=main&label=CI)](https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy/actions)

---

## 为什么做这个

Andrej Karpathy 最近发推聊到一个大家都遇到过的痛点：现在的推理模型思考越来越深，但吐出来的长篇回答阅读成本极高。模型习惯堆叠长难句、被动语态和一堆正确的废话。

他的建议很实用：让模型按照 **ASD-STE100**（或者 80% 的规范）来解释事情。这套受控英语标准原本是航空工业为了避免机械师读错飞机维修手册而制定的。如果文字还是太密，就顺着阶梯往上走：直接出图、出 HTML 交互卡片，或者出解说脚本。

这个仓库把这套思路整理成了三样东西：
1. 一个 **DeepSeek Harness 插件**，安装后全局默认生效，日常对话不用每次手动写提示词。
2. 一个独立的 **`SKILL.md`**，可以随时丢进 Claude Code、OpenAI Codex、Cursor 或 OpenCode 中当技能使用。
3. 一个本地 **Python Linter 脚本**（`scripts/ste_linter.py`），用于扫描 Markdown 文档是否符合这套规约。

---

## 核心规则

完全照搬 ASD-STE100 会把词汇量锁死在 900 多个基础词，普通技术讨论容易显得过于死板。结合 Karpathy 的建议，这里默认采用 **80% 受控模式**：保留语法和结构硬约束，放开专业软件术语。

- **控制单句长度**：操作指令每句不超过 20 词，概念描述每句不超过 25 词（中文单句不超过 35 字）。一句话只讲一个事实或动作。
- **强制主动语态**：句子必须写出执行主体。例如写“服务器丢弃了数据包”，不写“数据包被服务器丢弃”。
- **条件在前，动作在后**：指令一律采用“如果发生 X，执行 Y”的顺序，避免先做再看前提。
- **情态动词收敛**：只允许使用 `can`（能够）、`will`（必然）和 `must`（必须）。禁止使用模糊的 `should`、`could`、`might`。
- **去除 AI 虚词**：过滤 *clearly, delve, seamlessly, significantly, 显而易见, 深入探讨* 等无增量副词，禁止使用破折号（—）和分号（;）。
- **三级输出阶梯**：
  - **Level 1**：平实短句直接陈述事实。
  - **Level 2**：涉及 3 步以上的流程或状态机，自动附带简短的 Mermaid 流程图。
  - **Level 3**：结论先在 1 到 3 句话内直给；底层排查日志、长篇推导统一收纳进 `<details>` 折叠块。

---

## 快速上手

### 1. 在 DeepSeek Harness 中使用

克隆到本地插件目录：
```bash
git clone https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy.git ~/.dsh/plugins/dsh-plugin-ste100
```

在 `~/.dsh/profiles/desktop/cordis.patch.yml` 中添加配置：
```yaml
- insert:
    - id: ste100-explainer
      name: '@local/dsh-plugin-ste100'
      config:
        enabled: true
        mode: '80%-ste'
        maxSentenceWords: 20
        enableDiagrams: true
        enableProgressiveDisclosure: true
```

重启 DSH 或刷新前端页面，在侧边栏的插件管理中即可看到生效状态。

### 2. 在 Claude Code / Codex / Cursor 中作为 Skill 使用

无需安装 Node.js 环境或 DSH，直接拷贝根目录下的 `SKILL.md` 到对应工具的 skills 目录：

```bash
# Claude Code
mkdir -p ~/.claude/skills/asd-ste100
cp SKILL.md ~/.claude/skills/asd-ste100/SKILL.md

# OpenAI Codex
mkdir -p ~/.codex/skills/asd-ste100
cp SKILL.md ~/.codex/skills/asd-ste100/SKILL.md

# 当前项目工作区（Cursor, OpenCode）
mkdir -p .skills/asd-ste100
cp SKILL.md .skills/asd-ste100/
```

---

## 效果对比

### 场景：解释数据库高可用故障转移机制

**常规大模型输出：**
> "值得注意的是，当主数据库发生意外故障时，心跳哨兵机制将无缝编排向从副本的自动化故障转移序列，从而在无需人工干预的情况下确保高可用性得到妥善维护。"

**受控语言与输出阶梯处理后：**
> 主数据库可能发生故障。  
> 如果心跳哨兵检测到故障，它会将从副本提升为主库。  
> 新主库立即承接读写流量。  
> 整个过程不需要人工介入。  
> 
> ```mermaid
> flowchart LR
>     A[主库故障] -->|心跳超时| B[哨兵检测到异常]
>     B -->|提升主库| C[从副本成为新主库]
>     C --> D[恢复正常读写]
> ```

---

## 配置参数

可以在 DSH 设置面板或 `cordis.patch.yml` 中修改以下参数：

| 参数 | 默认值 | 说明 |
|---|---|---|
| `enabled` | `true` | 是否启用受控输出规则。 |
| `mode` | `'80%-ste'` | `80%-ste`（兼顾可读性与自然度）或 `strict`（严格全词表锁定）。 |
| `maxSentenceWords` | `20` | 英文规程句的最大单词上限。 |
| `maxChineseChars` | `35` | 中文单句最大字数上限。 |
| `enableDiagrams` | `true` | 是否对多步流程自动附加 Mermaid 流程图。 |
| `enableProgressiveDisclosure` | `true` | 是否将深层推导和日志自动收纳进折叠块。 |

---

## 本地规则校验器（Linter）

仓库附带了一个轻量 Python 脚本，用于检查本地文档是否符合上述规范：

```bash
python scripts/ste_linter.py path/to/doc.md
```

它会自动检测：
- 超过词数或字数上限的长句；
- 被动语态与悬挂分词（如 `, thereby ...-ing`）；
- 非法情态动词（should, could, might 等）；
- 破折号、分号与常见 AI 虚词。

---

## 开源协议

MIT
