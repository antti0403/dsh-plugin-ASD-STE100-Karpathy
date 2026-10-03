[English](README.md) | [简体中文](README.zh-CN.md)

# dsh-plugin-ASD-STE100-Karpathy

A DeepSeek Harness plugin and agent skill that makes LLMs write plain, direct technical English. Based on the ASD-STE100 Issue 9 aerospace specification and Andrej Karpathy's output ladder notes.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard: ASD-STE100 Issue 9](https://img.shields.io/badge/Standard-ASD--STE100%20Issue%209-informational.svg)](https://www.asd-ste100.org)
[![CI Status](https://img.shields.io/github/actions/workflow/status/antti0403/dsh-plugin-ASD-STE100-Karpathy/ci.yml?branch=main&label=CI)](https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy/actions)

---

## Why this exists

Andrej Karpathy posted recently about a familiar headache: reasoning models think deeper now, but reading their output is exhausting. They default to nested clauses, passive voice, and conversational boilerplate. 

His suggestion was straightforward: tell the model to explain things in **ASD-STE100** (or ~80% of it). That is the controlled English standard aviation engineers wrote to prevent mechanics from misreading maintenance manuals. When text still feels too dense, move up the ladder: use diagrams, HTML cards, or short scripts.

This repository packages that workflow into three things:
1. A **DeepSeek Harness plugin** that turns the behavior on by default across all sessions.
2. A portable **`SKILL.md`** you can copy into Claude Code, OpenAI Codex, Cursor, or OpenCode.
3. A standalone **Python linter** (`scripts/ste_linter.py`) to check your Markdown files against the rules.

---

## The rules it enforces

Full ASD-STE100 locks vocabulary down to ~900 approved words, which can make everyday tech discussions sound robotic. Following Karpathy's tip, this setup uses an **80% profile**: it keeps all structural and grammatical constraints while letting you use standard software domain terms.

- **Short sentences**: Maximum 20 words for instructions, 25 words for descriptions (or 35 characters in Chinese). One fact or action per sentence.
- **Active voice**: Always name the actor. *"The server drops the packet"*, not *"The packet is dropped"*.
- **Condition before command**: Write *"If the build fails, check the log"*, never *"Check the log if the build fails"*.
- **Three modal verbs only**: Use `can` (capability), `will` (certainty), and `must` (requirement). No `should`, `would`, `could`, or `might`.
- **No AI filler**: Drops words like *clearly, delve, seamlessly, significantly, tapestry, crucial to note*, along with semicolons and em dashes.
- **Output ladder**:
  - **Level 1**: Clean, short-sentence prose.
  - **Level 2**: If a flow has more than 3 steps, append a concise Mermaid diagram.
  - **Level 3**: State the conclusion first in 1-3 sentences. Put raw traces, proof steps, or debug logs inside `<details>` tags.

---

## Quick start

### 1. DeepSeek Harness (DSH)

Clone the repo into your local plugins directory:
```bash
git clone https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy.git ~/.dsh/plugins/dsh-plugin-ste100
```

Add it to `~/.dsh/profiles/desktop/cordis.patch.yml`:
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

Restart Harness (or refresh the Web GUI). The plugin will show as active under your installed plugins list.

### 2. Claude Code / Codex / Cursor

You do not need Node.js or DSH to use this with other coding agents. Copy `SKILL.md` into your agent's skill directory:

```bash
# Claude Code
mkdir -p ~/.claude/skills/asd-ste100
cp SKILL.md ~/.claude/skills/asd-ste100/SKILL.md

# OpenAI Codex
mkdir -p ~/.codex/skills/asd-ste100
cp SKILL.md ~/.codex/skills/asd-ste100/SKILL.md

# Current repository / workspace (Cursor, OpenCode)
mkdir -p .skills/asd-ste100
cp SKILL.md .skills/asd-ste100/
```

---

## Example

### Explaining a database failover

**Typical model response:**
> "It is crucial to note that when the primary database encounters an unexpected outage, the heartbeat sentinel will seamlessly orchestrate an automated failover sequence to the secondary replica, thereby ensuring high availability is preserved without human intervention."

**With ASD-STE100 & Output Ladder:**
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

## Configuration options

These options can be tweaked in the DSH settings panel or in `cordis.patch.yml`:

| Option | Default | What it does |
|---|---|---|
| `enabled` | `true` | Turns the prompt directive on or off. |
| `mode` | `'80%-ste'` | `80%-ste` (practical readability) or `strict` (full dictionary lockdown). |
| `maxSentenceWords` | `20` | Maximum word count per sentence for procedural steps. |
| `maxChineseChars` | `35` | Maximum character count per sentence for Chinese text. |
| `enableDiagrams` | `true` | Automatically appends Mermaid diagrams for multi-step processes. |
| `enableProgressiveDisclosure` | `true` | Wraps long derivations and logs in collapsible HTML details. |

---

## Using the linter

The repo includes a Python script to check whether existing Markdown docs follow these rules:

```bash
python scripts/ste_linter.py path/to/doc.md
```

It flags:
- Sentences over the word or character limit.
- Passive voice and dangling participles (`, thereby ...-ing`).
- Disallowed modals (`should`, `could`, `might`).
- Em dashes, semicolons, and common AI filler words.

---

## License

MIT
