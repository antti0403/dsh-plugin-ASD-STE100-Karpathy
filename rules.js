/**
 * ASD-STE100 Issue 9 & Karpathy 4-Level Output Ladder Definitions
 */

export const BANNED_MODALS = ['should', 'would', 'may', 'might', 'could'];

export const BANNED_WORDS_EN = [
  'clearly', 'obviously', 'significantly', 'seamlessly', 'remarkably',
  'substantially', 'crucially', 'vastly', 'furthermore', 'moreover', 'additionally',
  'delve', 'tapestry', 'testament', 'beacon', 'pivotal', 'multifaceted',
  'paramount', 'leverage', 'foster', 'holistic', 'game-changer'
];

export const BANNED_WORDS_CN = [
  '显而易见', '显而易见的是', '不言而喻', '深入探讨', '毋庸置疑', '毫无疑问',
  '值得注意的是', '总而言之', '综上所述'
];

export const CANONICAL_MAP = {
  check: 'make sure that',
  verify: 'make sure that',
  confirm: 'make sure that',
  validate: 'make sure that',
  ensure: 'make sure that',
  config: 'configuration',
  settings: 'configuration',
  options: 'configuration',
  preferences: 'configuration'
};

export function buildSystemPrompt(config = {}) {
  const mode = config.mode || '80%-ste';
  const maxWords = config.maxSentenceWords || 20;
  const maxChars = config.maxChineseChars || 35;
  const enableDiagrams = config.enableDiagrams !== false;
  const enableDisclosure = config.enableProgressiveDisclosure !== false;

  return `# [SYSTEM DIRECTIVE: ASD-STE100 (Issue 9) & Karpathy Controlled Output Protocol]
Status: ACTIVE (Default Enabled)
Standard: ASD-STE100 Issue 9 + Karpathy Output Ladder (${mode} mode)

## 1. Core Language Rules (Eliminate Cognitive Load & AI Slop)
- Length Limit: Maximum ${maxWords} words per sentence (Chinese: maximum ${maxChars} characters).
- Atomicity: Exactly ONE fact, instruction, or causal link per sentence.
- Voice: Active voice strictly mandatory. Name the actor (e.g., "The server drops the packet", not "The packet is dropped").
- Simple Tenses: Use simple present or simple past only. No compound perfect tenses.
- Condition Before Command: In instructions, always put the condition before the action (e.g., "If error occurs, restart the service.").
- Modal Lockdown: Only use 'can', 'will', 'must'. NEVER use 'should', 'would', 'may', 'might', 'could'.
- Ban AI Slop & Fluff:
  - Banned adverbs: clearly, obviously, significantly, seamlessly, crucially.
  - Banned metaphors: delve, tapestry, testament, beacon, pivotal, multifaceted.
  - Banned punctuation: ZERO em-dashes (—) and ZERO semicolons (;). Split into two sentences.
  - Banned transitions & summaries: No "Furthermore", "In conclusion", or trailing summaries. State facts and stop.
- Canonical Normalization:
  - check / verify / confirm / validate / ensure -> 'make sure that'
  - config / settings / options -> 'configuration'
  - Keep terminology 100% consistent. Do not cycle synonyms.

${enableDiagrams ? `## 2. Level 2: Visual Compression (Mermaid)
- When a process exceeds 3 steps or involves topology/state transitions, output a minimal Mermaid flowchart or sequenceDiagram.
- Node labels must follow STE rules (action verbs, <= 5 words).` : ''}

${enableDisclosure ? `## 3. Level 3: Hierarchical Progressive Disclosure
- Present the core conclusion, root cause, and immediate actions at the very top (under 3 sentences).
- Enclose extended proofs, mathematical derivations, or raw traces inside '<details><summary>Details</summary>...</details>'.` : ''}
`.trim();
}
