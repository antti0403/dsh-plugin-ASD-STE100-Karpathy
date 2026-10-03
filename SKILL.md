---
name: asd-ste100-explainer
description: "Explain complex concepts or rewrite dense LLM outputs using the mature ASD-STE100 (Issue 9) standard and Andrej Karpathy's 4-Level Output Ladder. Eliminates AI slop, passive voice, and ambiguous syntax. Triggers on: 'explain simply', 'STE-100', 'ASD-STE100', 'controlled language', 'plain English', 'remove AI slop', 'de-slop', 'make readable', 'condition before command', or when technical outputs read as dense and hedged."
version: "2.1.0"
standard: "ASD-STE100 Issue 9 (2025-01-15) & Karpathy Output Ladder"
compatibility: "claude-code codex cursor gemini-cli deepseek-harness opencode"
license: "MIT"
---

# ASD-STE100 Controlled Technical Explainer

Based on Andrej Karpathy's recommendation for handling increasingly complex LLM reasoning outputs, this skill enforces the aerospace **ASD-STE100 Issue 9** controlled natural language specification and a **4-Level Output Ladder** to eliminate cognitive overload, AI slop, and syntactic ambiguity.

---

## 1. When to Activate

Trigger this skill automatically or on demand when:
- Explaining complex architectures, engineering root-causes, algorithms, or protocol states.
- Rewriting dense, hedged, academic, or overly verbose LLM responses / CoT reasoning traces.
- Generating agent-facing instructions, tool descriptions, or error messages that downstream systems must parse unambiguously.
- The user asks for "plain English", "layman terms", "STE-100", "de-slop", "clean writing", or "80% STE".

---

## 2. Operational Modes

Determine the mode before generation:

1. **Strict Mode**: (Procedures, error messages, tool descriptions, inter-agent instructions, safety-critical text). Full compliance with hard length caps, modals lockdown, and canonical vocabulary mapping.
2. **STE-Flavored / 80% Mode (Default)**: (General technical explanations, READMEs, architectural summaries, analysis). Enforces all structural, length, tense, and voice rules while relaxing the base ~900 approved words lockdown to prevent unnatural robotic phrasing.

---

## 3. Level 1: Core Writing Rules (ASD-STE100 Issue 9)

### 3.1 Register Split: Procedural vs Descriptive Text
- **Procedural Text (Actions & Instructions)**:
  - Mood: Imperative.
  - Length: Maximum **20 words** per sentence.
  - Scope: Exactly **ONE instruction** per sentence.
  - Condition Before Command: Always put conditions before actions, separated by a comma (e.g., *"If the build fails, read the log."*).
- **Descriptive Text (Explanations & Facts)**:
  - Tense: Simple present or simple past only.
  - Length: Maximum **25 words** per sentence (Chinese: ≤ **35 characters**).
  - Scope: Exactly **ONE concept or causal link** per sentence.
  - Paragraph Ceiling: Maximum **6 sentences** per paragraph.

### 3.2 Tense & Voice Discipline
- **Active Voice Mandatory**: Name the actor. Write *"You run the script"* or *"The engine drops the packet"*, never *"The packet is dropped"*.
- **Simple Tenses Only**: No present perfect (*"has completed"* → *"completed"*). No continuous auxiliary loops (*"is processing"* → *"processes"*).
- **No Dangling Participles**: Never use a comma followed by an `-ing` verb (e.g., ban *", thereby making it easy to..."*). Split into a new sentence and name the cause.

### 3.3 Modal Verb Lockdown
Use only three modal verbs:
- **`can`**: expresses physical capability or possibility.
- **`will`**: expresses inevitable future state.
- **`must`**: expresses a mandatory requirement.
- **Strictly Banned**: `should`, `would`, `may`, `might`, `could`. If something is optional, use: *"If you want X, do Y."* If mandatory, change `should` to `must`.

### 3.4 Elimination of AI Slop & Banned Vocabulary
- **Banned Adverbs**: *clearly, obviously, significantly, seamlessly, remarkably, substantially, crucially, vastly*.
- **Banned AI Metaphors & Crutches**: *delve, tapestry, testament, beacon, pivotal, multifaceted, paramount, leverage, foster, holistic, game-changer*.
- **Banned Transitions**: *Furthermore, Moreover, Additionally, Having said that, It is worth noting*.
- **Banned Punctuation**: **Zero em-dashes (`—`)** and **zero semicolons (`;`)**. Break into two independent sentences.
- **No Trailing Summaries**: Ban *"In conclusion..."*, *"In summary..."*, or *"Overall, it is important to remember..."*. State the fact and end.

### 3.5 Terminology & Canonical Mapping
- **One Word, One Meaning**: Never cycle synonyms for stylistic variety.
- **Canonical Replacements**:
  - *check / verify / confirm / validate / ensure* → **`make sure that`**
  - *config / settings / options / preferences* → **`configuration`**
  - *perform an evaluation / make a decision* → **`evaluate` / `decide`** (De-nominalize verbs)
- **Noun Clusters**: Maximum 3 consecutive nouns. Break longer stacks with prepositions (e.g., *"the timeout parameter of the connection pool"*, not *"connection pool timeout parameter configuration"*).

---

## 4. The 4-Level Output Ladder (Karpathy Framework)

| Level | Media | Trigger & Structure |
|---|---|---|
| **Level 1** | **80% STE Text** | Base text for all answers. Follows Section 3 rules. |
| **Level 2** | **Diagrams** | Whenever a process exceeds 3 steps or describes topologies/state machines. Outputs minimal Mermaid (`flowchart LR` or `sequenceDiagram`). Node labels follow STE (action verbs ≤ 5 words). |
| **Level 3** | **Interactive Cards** | When presenting layered answers. Top: Core conclusion + root cause + action (under 3 sentences). Bottom: Deep proof, mathematical derivation, or raw traces folded inside `<details><summary>Details</summary>...</details>`. |
| **Level 4** | **Animation Script** | When requested for educational or high-retention topics: Output structured 3b1b / Manim Community code with synchronized voiceover scripts. |

---

## 5. Bilingual Few-Shot Examples

### Example 1: Architecture & Failover (Bilingual)

❌ **Standard AI Output (Slop & Complex)**:
> "It is crucial to note that when the primary database encounters an unexpected outage, the heartbeat sentinel will seamlessly orchestrate an automated failover sequence to the secondary replica, thereby ensuring high availability is preserved without human intervention."

✅ **ASD-STE100 Level 1 + Level 2 Output**:
> The primary database can fail.
> If the heartbeat sentinel detects a failure, it promotes the replica to primary.
> The replica serves read and write traffic immediately.
> The system does not need manual intervention.

```mermaid
flowchart LR
    A[Primary DB Fails] -->|Heartbeat Timeout| B[Sentinel Detects Fault]
    B -->|Promote| C[Replica Becomes Primary]
    C --> D[Resume Traffic]
```

---

### Example 2: Bug Analysis (Chinese)

❌ **常规大模型回答（长难句、被动语态、空泛副词）**:
> "显而易见的是，该线上偶发崩溃主要是由于异步任务在执行状态变更时，底层的线程锁资源未能得到妥善的释放，从而在并发争抢极其激烈的情形下导致了死锁现象的发生。"

✅ **ASD-STE100 中文受控规范**:
> 异步任务修改执行状态。
> 如果修改失败，该任务不释放线程锁。
> 后续线程争抢未释放的锁。
> 系统进入死锁状态并崩溃。

---

## 6. Pre-Flight Verification Checklist

Before emitting the final response, verify:
- [ ] Is the active voice used everywhere?
- [ ] Are procedural sentences strictly ≤ 20 words (descriptive ≤ 25 words / Chinese ≤ 35 chars)?
- [ ] Are conditions written before actions (`If X, do Y`)?
- [ ] Are modals restricted to `can`, `will`, `must`?
- [ ] Are em-dashes, semicolons, and AI slop words (*delve, clearly, seamlessly*) completely absent?
- [ ] Did I stop without appending an unnecessary summary paragraph?
