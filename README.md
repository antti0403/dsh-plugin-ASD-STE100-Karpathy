<div align="right">
  <strong>English</strong> | <a href="./README.zh-CN.md">简体中文</a>
</div>

# dsh-plugin-ASD-STE100-Karpathy ✈️

> **"Make LLMs write like a Boeing aircraft manual, not a LinkedIn post."**  
> A controlled natural language and output-ladder plugin for AI agents and DeepSeek Harness, built on the international aerospace standard **ASD-STE100 Issue 9 (2025-01-15)** and **Andrej Karpathy's 4-Level Output Ladder**.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard: ASD-STE100 Issue 9](https://img.shields.io/badge/Standard-ASD--STE100%20Issue%209-red.svg)](https://www.asd-ste100.org)
[![Platform: DeepSeek Harness & Multi-Agent](https://img.shields.io/badge/Platform-DSH%20%7C%20Codex%20%7C%20Claude%20Code-green.svg)](#)
[![GitHub release](https://img.shields.io/github/v/release/antti0403/dsh-plugin-ASD-STE100-Karpathy)](https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy/releases)

</div>

---

## 💡 Why This Plugin?

On **October 2, 2026**, former OpenAI / Tesla founding scientist **Andrej Karpathy** noted:
> *"We'll be spending a lot more time trying to understand the outputs of language models. A few thoughts, tips & tricks..."*

As reasoning models scale (longer Chain-of-Thought, deep reasoning), their outputs become increasingly verbose, convoluted, and laden with nested subordinate clauses, passive voice, and uninformative "AI slop". 

To break this cognitive bottleneck, Karpathy recommended using **ASD-STE100 (Simplified Technical English)**. This plugin operationalizes his insight alongside 40 years of aerospace documentation discipline into an installable plugin for **DeepSeek Harness (DSH)** and a zero-dependency **Skill** for **OpenAI Codex, Claude Code, Cursor, and OpenCode**.

---

## ✨ Key Features

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

## 🚀 Quick Start & Installation

### Method 1: In DeepSeek Harness (DSH)

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

### Method 2: In OpenAI Codex / Claude Code / Cursor (Universal Skill)

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

## ⚙️ Configuration Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `enabled` | `boolean` | `true` | Globally enables controlled natural language generation. |
| `mode` | `'80%-ste' \| 'strict'` | `'80%-ste'` | `80%-ste` (softened, natural readability) or `strict` (aerospace-grade lexical lockdown). |
| `maxSentenceWords` | `number` | `20` | Hard ceiling for words per sentence (procedural text). |
| `maxChineseChars` | `number` | `35` | Character ceiling for Chinese sentences. |
| `enableDiagrams` | `boolean` | `true` | Generates Level 2 Mermaid flowcharts for complex state flows. |
| `enableProgressiveDisclosure` | `boolean` | `true` | Folds extended logs and mathematical proofs into `<details>` tags. |

---

## 📊 Before vs. After Comparison

### Scenario: Explaining High Availability Failover

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

## 🛠️ CLI Linter Tool

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

## 📄 License

This project is licensed under the [MIT License](LICENSE).
