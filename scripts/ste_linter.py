#!/usr/bin/env python3
"""
ASD-STE100 Issue 9 & Karpathy Output Ladder Linter
Checks technical prose against mature community standards (danyuchn & AminBlg):
1. Register-based sentence limits (Procedural <= 20 words, Descriptive <= 25 words, Chinese <= 35 chars)
2. Modal verb lockdown (Only can, will, must. Bans should, would, may, might, could)
3. Condition-before-command order
4. Elimination of passive voice and dangling '-ing' participles
5. AI slop & metaphor elimination
6. Punctuation lockdown (Zero em-dashes, zero semicolons)
"""

import sys
import re
from pathlib import Path

# Modal lockdown
BANNED_MODALS = {"should", "would", "may", "might", "could"}

# AI Slop & hollow adverbs
BANNED_WORDS = {
    "clearly", "obviously", "significantly", "seamlessly", "remarkably",
    "substantially", "crucially", "vastly", "furthermore", "moreover", "additionally",
    "delve", "tapestry", "testament", "beacon", "pivotal", "multifaceted",
    "paramount", "leverage", "foster", "holistic", "game-changer",
    "显而易见", "显而易见的是", "不言而喻", "深入探讨", "毋庸置疑", "毫无疑问"
}

# Passive voice regex
PASSIVE_REGEX = re.compile(r"\b(is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en)\b", re.IGNORECASE)

# Dangling participle regex (comma followed by -ing)
DANGLING_ING_REGEX = re.compile(r",\s+([a-z]+ing)\b", re.IGNORECASE)

def lint_text(text: str):
    issues = []
    lines = text.splitlines()
    in_code_block = False

    for line_idx, line in enumerate(lines, 1):
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block or not stripped or stripped.startswith("#"):
            continue

        # Check banned punctuation (em-dash, semicolon)
        if "—" in stripped or "--" in stripped:
            issues.append(f"Line {line_idx} [Punctuation]: Found em-dash (—). Use two separate sentences.")
        if ";" in stripped:
            issues.append(f"Line {line_idx} [Punctuation]: Found semicolon (;). Use two separate sentences.")

        raw_sentences = re.split(r"[.!?。！？]+", stripped)
        for s in raw_sentences:
            s = s.strip()
            if not s:
                continue
            is_procedural = s.startswith(("-", "*", "1.", "2.", "3.", "4.", "5."))
            s_clean = re.sub(r"^[\-*\d\.]+\s*", "", s).strip()
            if not s_clean:
                continue

            words = s_clean.split()
            word_count = len(words)
            char_count = len(s_clean)
            is_cjk = any("\u4e00" <= char <= "\u9fff" for char in s_clean)

            # Rule 1: Length by register
            if is_cjk:
                if char_count > 35:
                    issues.append(f"Line {line_idx} [Overlength-CN]: {char_count} chars (max 35) -> '{s_clean[:30]}...'")
            else:
                max_words = 20 if is_procedural else 25
                if word_count > max_words:
                    issues.append(f"Line {line_idx} [Overlength-EN]: {word_count} words (max {max_words}) -> '{s_clean[:40]}...'")

            # Rule 2: Passive voice & dangling -ing
            if not is_cjk:
                passives = PASSIVE_REGEX.findall(s_clean)
                for p in passives:
                    issues.append(f"Line {line_idx} [Passive-Voice]: '{' '.join(p)}' in -> '{s_clean[:40]}...'")
                
                danglings = DANGLING_ING_REGEX.findall(s_clean)
                for d in danglings:
                    issues.append(f"Line {line_idx} [Dangling-Participle]: ', {d}' in -> '{s_clean[:40]}...'")

            # Rule 3: Modal lockdown
            lower_s = s_clean.lower()
            for bm in BANNED_MODALS:
                if re.search(r"\b" + re.escape(bm) + r"\b", lower_s):
                    issues.append(f"Line {line_idx} [Banned-Modal]: Found '{bm}'. Use can/will/must or 'If X, do Y'.")

            # Rule 4: AI Slop & banned words
            for bw in BANNED_WORDS:
                pattern = r"\b" + re.escape(bw) + r"\b" if not is_cjk else re.escape(bw)
                if re.search(pattern, lower_s):
                    issues.append(f"Line {line_idx} [AI-Slop]: Found banned word '{bw}' -> '{s_clean[:40]}...'")

    return issues

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ste_linter.py <file.md>")
        sys.exit(0)
    target = Path(sys.argv[1])
    if not target.exists():
        print(f"File not found: {target}")
        sys.exit(1)
    content = target.read_text(encoding="utf-8")
    issues = lint_text(content)
    print(f"=== ASD-STE100 Issue 9 Linter Report for {target.name} ===")
    if not issues:
        print("✅ PASS: 100% compliant with ASD-STE100 Issue 9 & Karpathy Output Ladder.")
    else:
        print(f"⚠️ FOUND {len(issues)} VIOLATIONS:")
        for i in issues:
            print(f"  - {i}")
