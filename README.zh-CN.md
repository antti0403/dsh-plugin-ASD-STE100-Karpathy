<div align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</div>

# dsh-plugin-ASD-STE100-Karpathy ✈️

> **"Make LLMs write like a Boeing aircraft manual, not a LinkedIn post."**  
> 基于航空航天 **ASD-STE100 Issue 9 (2025-01-15)** 最新国际标准与 **Andrej Karpathy 四级输出阶梯** 的受控语言与降维输出插件。

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Standard: ASD-STE100 Issue 9](https://img.shields.io/badge/Standard-ASD--STE100%20Issue%209-red.svg)](https://www.asd-ste100.org)
[![Platform: DeepSeek Harness & Multi-Agent](https://img.shields.io/badge/Platform-DSH%20%7C%20Codex%20%7C%20Claude%20Code-green.svg)](#)
[![GitHub release](https://img.shields.io/github/v/release/antti0403/dsh-plugin-ASD-STE100-Karpathy)](https://github.com/antti0403/dsh-plugin-ASD-STE100-Karpathy/releases)

</div>

---

## 💡 为什么需要这个插件？

2026 年 10 月 2 日，前 OpenAI / Tesla 科学家 **Andrej Karpathy** 提出：
> *"We'll be spending a lot more time trying to understand the outputs of language models. A few thoughts, tips & tricks..."*  
> （未来我们将花更多的时间去理解语言模型的输出。）

随着推理模型能力的飙升，大模型思考更深、但也变得更啰嗦、充斥着嵌套从句、被动语态、以及大量没有信息增量的“AI 废话（AI Slop）”。

为了解决人类认知带宽的瓶颈，Karpathy 推荐采用 **ASD-STE100（简明技术英语）**。本插件将该思路与航空工业 40 年防误读经验完整工程化，支持在 **DeepSeek Harness** 中默认开启，并可无缝分发给 **OpenAI Codex、Claude Code、Cursor** 等任何 Agent！

---

## ✨ 核心特性

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

## 🚀 安装与使用

### 方式 A：在 DeepSeek Harness 中使用（一键启用）

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

### 方式 B：在 OpenAI Codex / Claude Code / Cursor 中作为 Skill 使用

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

## ⚙️ 可视化配置项（Web GUI Config）

| 参数 | 类型 | 默认值 | 作用说明 |
|---|---|---|---|
| `enabled` | `boolean` | `true` | 是否全局启用插件（**默认开启**） |
| `mode` | `'80%-ste' \| 'strict'` | `'80%-ste'` | `80%-ste`（Karpathy 推荐的软化模式）或 `strict`（航空级全词表严格锁定） |
| `maxSentenceWords` | `number` | `20` | 英文单句最大词数（超过报错/折断） |
| `maxChineseChars` | `number` | `35` | 中文单句最大字数（严禁嵌套从句与过度修饰） |
| `enableDiagrams` | `boolean` | `true` | 自动生成 Mermaid 流程与时序图表 |
| `enableProgressiveDisclosure` | `boolean` | `true` | 自动将长篇推导收纳至 `<details>` 折叠卡片 |

---

## 📊 效果对比（Before vs After）

### 场景：解释分布式高可用故障转移机制

❌ **普通大模型生成（充满从句、被动语态与修辞废话）**：
> "It is crucial to note that when the primary database encounters an unexpected outage, the heartbeat sentinel will seamlessly orchestrate an automated failover sequence to the secondary replica, thereby ensuring high availability is preserved without human intervention."

✅ **dsh-plugin-ste100 处理后（清晰、原子化、秒懂）**：
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

## 🛠️ CLI 质检工具（Linter）

仓库内置了一款用 Python 标准库编写的快速质检脚本：
```bash
python scripts/ste_linter.py path/to/document.md
```
它会自动扫描并标出：
- 单句超长（>20 词 / >35 汉字）
- 非法情态动词（should, could, might）
- 被动语态与悬挂分词（*, thereby ...-ing*）
- AI 废话词库（delve, clearly, seamlessly 等）
- 破折号（—）与分号（;）

---

## 📄 授权许可 (License)

本项目遵循 [MIT License](LICENSE)。欢迎在 GitHub 上 Star、Fork 或提交 PR！
