import { buildSystemPrompt, BANNED_MODALS, BANNED_WORDS_EN, BANNED_WORDS_CN } from './rules.js';

export const name = 'dsh-plugin-ste100';

let z;
try {
  const schemastery = await import('@deepseek-ai/schemastery');
  z = schemastery.default || schemastery;
} catch {
  // Graceful fallback if Schemastery is not available in standalone mode
  z = {
    object: () => ({ description: () => ({}) }),
    boolean: () => ({ default: () => ({ description: () => ({}) }) }),
    union: () => ({ default: () => ({ description: () => ({}) }) }),
    number: () => ({ default: () => ({ description: () => ({}) }) })
  };
}

export const Config = z.object ? z.object({
  enabled: z.boolean().default(true).description('是否全局开启受控自然语言与 Karpathy 输出阶梯规范（默认开启）'),
  mode: z.union(['80%-ste', 'strict']).default('80%-ste').description('运行模式：80%-ste（推荐，兼顾清晰度与自然度）或 strict（航空级极简硬约束）'),
  maxSentenceWords: z.number().default(20).description('英文单句最大单词数上限（规程 ≤ 20 词，描述 ≤ 25 词）'),
  maxChineseChars: z.number().default(35).description('中文单句最大字数上限（严禁多重从句与复杂从属修饰）'),
  enableDiagrams: z.boolean().default(true).description('开启 Level 2 视觉压缩（超过 3 步的流程与拓扑自动输出 Mermaid）'),
  enableProgressiveDisclosure: z.boolean().default(true).description('开启 Level 3 渐进式折叠（核心结论置顶，细节推导收纳进 details）')
}).description('ASD-STE100 Issue 9 & Karpathy Output Ladder 配置') : {};

export function apply(ctx, config = {}) {
  const options = {
    enabled: config.enabled !== false,
    mode: config.mode || '80%-ste',
    maxSentenceWords: config.maxSentenceWords || 20,
    maxChineseChars: config.maxChineseChars || 35,
    enableDiagrams: config.enableDiagrams !== false,
    enableProgressiveDisclosure: config.enableProgressiveDisclosure !== false
  };

  // 1. 注册核心服务 ctx.ste100 供外部插件、自定义脚本或测试调用
  ctx.provide?.('ste100');
  ctx.ste100 = {
    options,
    getPrompt: () => buildSystemPrompt(options),
    lint: (text) => lintText(text, options)
  };

  if (!options.enabled) {
    console.log('[dsh-plugin-ste100] Plugin is disabled by configuration.');
    return;
  }

  console.log(`[dsh-plugin-ste100] Active (Mode: ${options.mode}, MaxWords: ${options.maxSentenceWords}, Diagrams: ${options.enableDiagrams})`);

  // 2. 挂载到会话装配钩子或事件流（如果宿主提供会话事件）
  ctx.on?.('session/create', (session) => {
    if (session && typeof session.appendSystemDirective === 'function') {
      session.appendSystemDirective(buildSystemPrompt(options));
    }
  });
}

/**
 * JS 版受控文本快速检查器
 */
export function lintText(text, options = {}) {
  const maxWords = options.maxSentenceWords || 20;
  const maxChars = options.maxChineseChars || 35;
  const issues = [];
  const lines = text.split('\n');
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode || !line || line.startsWith('#')) continue;

    if (line.includes('—') || line.includes('--')) {
      issues.push(`Line ${i + 1}: Found em-dash (—). Use separate sentences.`);
    }
    if (line.includes(';')) {
      issues.push(`Line ${i + 1}: Found semicolon (;). Use separate sentences.`);
    }

    const sentences = line.split(/[.!?。！？]+/);
    for (const rawS of sentences) {
      const s = rawS.replace(/^[\-*\d\.]+\s*/, '').trim();
      if (!s) continue;

      const isCjk = /[\u4e00-\u9fff]/.test(s);
      const words = s.split(/\s+/);

      if (isCjk && s.length > maxChars) {
        issues.push(`Line ${i + 1} [Overlength-CN]: ${s.length} chars (max ${maxChars}) -> "${s.slice(0, 20)}..."`);
      } else if (!isCjk && words.length > maxWords) {
        issues.push(`Line ${i + 1} [Overlength-EN]: ${words.length} words (max ${maxWords}) -> "${s.slice(0, 30)}..."`);
      }

      const lower = s.toLowerCase();
      for (const modal of BANNED_MODALS) {
        const reg = new RegExp(`\\b${modal}\\b`);
        if (reg.test(lower)) {
          issues.push(`Line ${i + 1} [Banned-Modal]: Found "${modal}". Use can/will/must.`);
        }
      }

      const bannedWords = isCjk ? BANNED_WORDS_CN : BANNED_WORDS_EN;
      for (const bw of bannedWords) {
        if (isCjk ? lower.includes(bw) : new RegExp(`\\b${bw}\\b`).test(lower)) {
          issues.push(`Line ${i + 1} [AI-Slop]: Found banned word "${bw}".`);
        }
      }
    }
  }

  return issues;
}
