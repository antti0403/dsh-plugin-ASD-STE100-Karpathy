# dsh-plugin-ASD-STE100-Karpathy ✈️

> **"Make LLMs write like a Boeing aircraft manual, not a LinkedIn post."**  
> A controlled natural language and output-ladder plugin for AI agents and DeepSeek Harness, built on the international aerospace standard **ASD-STE100 Issue 9 (2025-01-15)** and **Andrej Karpathy's 4-Level Output Ladder**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard: ASD-STE100 Issue 9](https://img.shields.io/badge/Standard-ASD--STE100%20Issue%209-red.svg)](https://www.asd-ste100.org)
[![Platform: DeepSeek Harness & Multi-Agent](https://img.shields.io/badge/Platform-DSH%20%7C%20Codex%20%7C%20Claude%20Code-green.svg)](#)

---

## English Documentation

### 💡 Why This Plugin?

On **October 2, 2026**, former OpenAI / Tesla founding scientist **Andrej Karpathy** pointed out:
> *"We'll be spending a lot more time trying to understand the outputs of language models. A few thoughts, tips & tricks..."*

As reasoning models scale (longer Chain-of-Thought, deep reasoning), their outputs become increasingly verbose, complex, and laden with nested subordinate clauses, passive voice, and uninformative "AI slop". 

To overcome human cognitive bottlenecks, Karpathy recommended using **ASD-STE100 (Simplified Technical English)**. This plugin operationalizes his insight alongside 40 years of aerospace documentation discipline into an installable plugin for **DeepSeek Harness (DSH)** and a zero-dependency **Skill** for **OpenAI Codex, Claude Code, Cursor, and OpenCode**.

---

### ✨ Key Features

- **Default Enabled**: Active out of the box in DeepSeek Harness. Automatically structures and clarifies model outputs without requiring manual prompting per turn.
- **Strict ASD-STE100 Issue 9 Compliance**:
  - **Register Split**: Procedural instructions ≤ 20 words/sentence; Descriptive prose ≤ 25 words/sentence.
  - **Condition Before Command**: Enforces `If X, do Y` syntax (*"If the build fails, read the log."*).
  - **Active Voice Mandatory**: Eliminates ambiguous passive constructions; explicitly names actors.
  - **Modal Verb Lockdown**: Allows only `can`, `will`, `must`. Strictly bans ambiguous modals (`should / could / might / would / may`).
  - **Zero AI Slop**: Completely eliminates hollow buzzwords (*clearly, delve, seamlessly, tapestry, crucial to note*) and stylistic em-dashes (`—`).
- **Karpathy's 4-Level Output Ladder**:
  - **Level 1 (Controlled Prose)**: 80% ASD-STE100 plain technical English for facts, summaries, and explanations.
  - **Level 2 (Visual Compression)**: Automatically pairs multi-step processes (> 3 steps) or topologies with compact Mermaid flowcharts.
  - **Level 3 (Progressive Disclosure)**: Delivers immediate conclusions up front (≤ 3 sentences); folds raw derivations and logs inside `<details>` cards.
  - **Level 4 (Multimodal Scripting)**: Generates 3Blue1Brown/Manim-style visualization scripts upon request.
- **Dual Architecture (Plugin + Universal Skill)**:
  - **DeepSeek Harness Plugin**: Native Cordis plugin with a graphical configuration panel in Web GUI settings.
  - **Universal Agent Skill**: Self-contained `SKILL.md` drop-in compatible with Claude Code, OpenAI Codex, Cursor, and Gemini CLI.
- **Built-in Quality Linter**: Includes `scripts/ste_linter.py` to audit documentation compliance locally or in CI/CD pipelines.

---

### 🚀 Quick Start & Installation

#### Method 1: In DeepSeek Harness (DSH)

1. Clone or copy into your DSH plugins directory:
   ```bash
   git clone https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy.git ~/.dsh/plugins/dsh-plugin-ste100
   ```

2. Add the bundle entry into your profile manifest (`~/.dsh/profiles/desktop/cordis.patch.yml`):
   ```yaml
   - insert:
       - id: ste100-explainer
         name: '@local/dsh-plugin-ste100'
         config:
           enabled: true
           mode: '80%-ste'       # Recommended: 80% STE mode
           maxSentenceWords: 20  # Sentence length ceiling
           enableDiagrams: true  # Automatic Mermaid diagrams
           enableProgressiveDisclosure: true # Folding details
   ```

3. Restart DeepSeek Harness. The plugin will appear as **Live** in your sidebar plugin manager.

---

#### Method 2: In OpenAI Codex / Claude Code / Cursor (Universal Skill)

No Node.js runtime required. Simply copy the standalone `SKILL.md` into your agent skill directory:

```bash
# For OpenAI Codex
mkdir -p ~/.codex/skills/asd-ste100
cp SKILL.md ~/.codex/skills/asd-ste100/SKILL.md

# For Claude Code
mkdir -p ~/.claude/skills/asd-ste100
cp SKILL.md ~/.claude/skills/asd-ste100/SKILL.md

# For Project-Level Usage (Cursor / OpenCode)
mkdir -p .skills/asd-ste100
cp SKILL.md .skills/asd-ste100/
```

---

### ⚙️ Configuration Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Globally enables controlled natural language generation. |
| `mode` | `'80%-ste' \| 'strict'` | `'80%-ste'` | `80%-ste` (softened, natural readability) or `strict` (aerospace-grade lexical lockdown). |
| `maxSentenceWords` | `number` | `20` | Hard ceiling for words per sentence (procedural text). |
| `maxChineseChars` | `number` | `35` | Character ceiling for Chinese sentences. |
| `enableDiagrams` | `boolean` | `true` | Generates Level 2 Mermaid flowcharts for complex state flows. |
| `enableProgressiveDisclosure` | `boolean` | `true` | Folds extended logs and mathematical proofs into `<details>` tags. |

---

### 📊 Before vs. After Comparison

#### Scenario: Explaining High Availability Failover

❌ **Standard AI Output (Fluff, Passive Voice, Complex Syntax)**:
> "It is crucial to note that when the primary database encounters an unexpected outage, the heartbeat sentinel will seamlessly orchestrate an automated failover sequence to the secondary replica, thereby ensuring high availability is preserved without human intervention."

✅ **ASD-STE100 & Karpathy Ladder Output (Atomic, Direct, Clear)**:
> The primary database can fail.  
> If the heartbeat sentinel detects a failure, it promotes the replica to primary.  
> The replica serves read and write traffic immediately.  
> The system does not need manual intervention.  
> 
> ```mermaid
> flowchart LR
>     A[Primary DB Fails] -->|Heartbeat Timeout| B[Sentinel Detects Fault]
>     B -->|Promote| C[Replica Becomes Primary]
>     C --> D[Resume Traffic]
> ```

---

### 🛠️ CLI Linter Tool

Test your documentation for compliance using the bundled Python script:
```bash
python scripts/ste_linter.py path/to/document.md
```
It automatically scans for:
- Overlength sentences (> 20 words procedural / > 25 descriptive / > 35 Chinese chars).
- Passive voice and dangling participles (`, thereby ...-ing`).
- Forbidden modal verbs (`should, would, may, could`).
- AI slop vocabulary and banned punctuation (`—`, `;`).

---

<br/>

## 中文说明文档 (Chinese Documentation)

### 💡 为什么需要这个插件？

2026 年 10 月 2 日，前 OpenAI / Tesla 科学家 **Andrej Karpathy** 提出：
> *"We'll be spending a lot more time trying to understand the outputs of language models. A few thoughts, tips & tricks..."*  
> （未来我们将花更多的时间去理解语言模型的输出。）

随着推理模型能力的飙升，大模型思考更深、但也变得更啰嗦、充斥着嵌套从句、被动语态、以及大量没有信息增量的“AI 废话（AI Slop）”。

为了解决人类认知带宽的瓶颈，Karpathy 推荐采用 **ASD-STE100（简明技术英语）**。本插件将该思路与航空工业 40 年防误读经验完整工程化，支持在 **DeepSeek Harness** 中默认开启，并可无缝分发给 **OpenAI Codex、Claude Code、Cursor** 等任何 Agent！

---

### ✨ 核心特性

- **默认开启（Default Enabled）**：无需在每轮会话中打暗号，启动即全局生效，自动约束大模型输出。
- **ASD-STE100 Issue 9 标准约束**：
  - 严格分轨：规程指令 ≤ 20 词/句，描述说明 ≤ 25 词/句（中文 ≤ 35 字）；
  - 条件在前、指令在后（*If X, do Y*）；
  - 强制主动语态，严禁被动语态；
  - 情态动词锁定：仅保留 `can`、`will`、`must`，封杀 `should / could / might`；
  - 零 AI 废话：彻底消灭 *clearly, obviously, delve, seamlessly* 等虚词与破折号（—）。
- **Karpathy 四级降维阶梯（Output Ladder）**：
  - **Level 1（受控文本）**：80% STE-100 平实技术表达；
  - **Level 2（视觉压缩）**：超 3 步复杂拓扑或状态机，强制伴随紧凑 Mermaid 图；
  - **Level 3（渐进折叠）**：核心结论置顶，长篇数学推导、日志和原始细节收纳至 `<details>` 折叠卡片；
  - **Level 4（多模态剧本）**：按需输出 3b1b / Manim 风格代码与旁白解说。
- **一包双用（Dual Architecture）**：
  - **作为 DSH 插件**：直接接入 Cordis 体系，带 Web GUI 可视化配置面板；
  - **作为通用 Agent Skill**：内置标准 `SKILL.md`，单文件拖入 Codex / Claude Code / Cursor 直接用。
- **内置规则体检仪**：配套提供 `scripts/ste_linter.py`，可在 CI/CD 或开发时一键体检 Markdown 合规性。

---

### 🚀 安装与使用

#### 方式 A：在 DeepSeek Harness 中使用（一键启用）

1. **安装插件目录**：
   将本仓库放入 `~/.dsh/plugins/dsh-plugin-ste100`

2. **在配置文件中挂载**：
   在 `~/.dsh/profiles/desktop/cordis.patch.yml` 中添加：
   ```yaml
   - insert:
       - id: ste100-explainer
         name: '@local/dsh-plugin-ste100'
         config:
           enabled: true
           mode: '80%-ste'       # 推荐：80% 模式，兼顾清晰与自然
           maxSentenceWords: 20  # 单句最大词数
           enableDiagrams: true  # 自动图表降维
           enableProgressiveDisclosure: true # 自动折叠深层细节
   ```

3. **保存并重启 DSH** 即可！在 Harness Web GUI 设置中心可直接看到该插件的可视化开关。

---

#### 方式 B：在 OpenAI Codex / Claude Code / Cursor 中作为 Skill 使用

无需安装 Node 依赖，直接复制仓库内的 `SKILL.md`：
```bash
# 复制到 Codex 全局技能库
cp -r SKILL.md ~/.codex/skills/asd-ste100/SKILL.md

# 复制到 Claude Code 全局技能库
cp -r SKILL.md ~/.claude/skills/asd-ste100/SKILL.md

# 或复制到当前项目工作区根目录
mkdir -p .skills/asd-ste100
cp SKILL.md .skills/asd-ste100/
```

---

### ⚙️ 可视化配置项（Web GUI Config）

| 参数 | 类型 | 默认值 | 作用说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 是否全局启用插件（**默认开启**） |
| `mode` | `'80%-ste' \| 'strict'` | `'80%-ste'` | `80%-ste`（Karpathy 推荐的软化模式）或 `strict`（航空级全词表严格锁定） |
| `maxSentenceWords` | `number` | `20` | 英文单句最大词数（超过报错/折断） |
| `maxChineseChars` | `number` | `35` | 中文单句最大字数（严禁嵌套从句与过度修饰） |
| `enableDiagrams` | `boolean` | `true` | 自动生成 Mermaid 流程与时序图表 |
| `enableProgressiveDisclosure` | `boolean` | `true` | 自动将长篇推导收纳至 `<details>` 折叠卡片 |

---

## 📄 授权许可 (License)

本项目遵循 [MIT License](LICENSE)。欢迎在 GitHub 上 Star、Fork 或提交 PR！
