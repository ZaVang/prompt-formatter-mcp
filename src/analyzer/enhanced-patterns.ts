import { DetectionPattern, DetectionPatterns } from '../types/index.js';

/**
 * Enhanced detection patterns with multilingual support and heuristic fallbacks
 *
 * Enhancement strategy:
 * 1. Add Chinese/multilingual patterns
 * 2. Add colon-based generic patterns
 * 3. Add paragraph segmentation heuristics
 * 4. Priority: XML tags > explicit markers > keywords > heuristics
 */

// ============================================================================
// INTRODUCTION / ROLE PATTERNS
// ============================================================================

const introductionPattern: DetectionPattern = {
  name: 'introduction',
  patterns: [
    // XML tags (highest priority)
    /^<introduction>([\s\S]*?)<\/introduction>/im,

    // English patterns
    /^you are (a|an) .+/im,
    /^act as (a|an) .+/im,
    /^your role is .+/im,
    /^as (a|an) .+/im,
    /^you're (a|an) .+/im,
    /^role:\s*.+/im,
    /^system:\s*.+/im,

    // Chinese patterns
    /^你是.+/im,
    /^你的角色是.+/im,
    /^你将扮演.+/im,
    /^作为一个.+/im,
    /^扮演.+角色/im,
    /^角色[:：]\s*.+/im,
    /^系统[:：]\s*.+/im,
  ],
  keywords: [
    // English
    'you are', 'act as', 'your role', 'as a', 'as an', 'role:', 'system:',
    // Chinese
    '你是', '你的角色', '扮演', '作为', '角色：', '角色:', '系统：', '系统:',
  ],
  priority: 1,
};

// ============================================================================
// RULES AND CONSTRAINTS PATTERNS
// ============================================================================

const rulesPattern: DetectionPattern = {
  name: 'rules',
  patterns: [
    // XML tags
    /^<rule>([\s\S]*?)<\/rule>/gim,
    /^<rules>([\s\S]*?)<\/rules>/im,
    /^<constraint[s]?>([\s\S]*?)<\/constraint[s]?>/im,

    // English explicit markers
    /^rules?:\s*.+/gim,
    /^constraints?:\s*.+/gim,
    /^requirements?:\s*.+/gim,
    /^guidelines?:\s*.+/gim,
    /^(?:you )?(?:must|should|always|never)\s+.+/gim,
    /^(?:do not|don't|avoid|refrain from)\s+.+/gim,
    /^(?:ensure|make sure|verify|check)\s+.+/gim,
    /^important:\s*.+/gim,
    /^critical:\s*.+/gim,
    /^note:\s*.+/gim,
    /^warning:\s*.+/gim,
    /^(?:\d+\.\s+)?(?:must|should|always|never)\s+.+/gim,
    /^-\s*(?:must|should|always|never|do not|don't|avoid|ensure)\s+.+/gim,

    // Chinese explicit markers
    /^规则[:：]\s*.+/gim,
    /^要求[:：]\s*.+/gim,
    /^约束[:：]\s*.+/gim,
    /^限制[:：]\s*.+/gim,
    /^指南[:：]\s*.+/gim,
    /^准则[:：]\s*.+/gim,
    /^(?:必须|应该|务必|一定要|禁止|不要|不能|避免)\s*.+/gim,
    /^(?:\d+[、.．])\s*(?:必须|应该|务必|一定要|禁止|不要|不能|避免)\s*.+/gim,
    /^-\s*(?:必须|应该|务必|一定要|禁止|不要|不能|避免)\s*.+/gim,
    /^重要[:：]\s*.+/gim,
    /^注意[:：]\s*.+/gim,
    /^警告[:：]\s*.+/gim,
  ],
  keywords: [
    // English
    'rule:', 'rules:', 'must', 'should', 'always', 'never',
    'do not', "don't", 'avoid', 'ensure', 'make sure',
    'important:', 'critical:', 'constraint:', 'requirement:',
    'guideline:', 'warning:', 'note:',
    // Chinese
    '规则：', '规则:', '要求：', '要求:', '约束：', '约束:',
    '限制：', '限制:', '必须', '应该', '务必', '一定要',
    '禁止', '不要', '不能', '避免', '重要：', '重要:',
    '注意：', '注意:', '警告：', '警告:',
  ],
  priority: 2,
};

// ============================================================================
// CONTEXT / BACKGROUND PATTERNS
// ============================================================================

const contextPattern: DetectionPattern = {
  name: 'context',
  patterns: [
    // XML tags
    /^<context>([\s\S]*?)<\/context>/im,
    /^<background>([\s\S]*?)<\/background>/im,

    // English patterns
    /^context:\s*.+/im,
    /^background:\s*.+/im,
    /^given that\s+.+/im,
    /^scenario:\s*.+/im,
    /^setting:\s*.+/im,
    /^situation:\s*.+/im,
    /^overview:\s*.+/im,

    // Chinese patterns
    /^背景[:：]\s*.+/im,
    /^上下文[:：]\s*.+/im,
    /^场景[:：]\s*.+/im,
    /^情境[:：]\s*.+/im,
    /^环境[:：]\s*.+/im,
    /^概述[:：]\s*.+/im,
    /^在.+的情况下/im,
  ],
  keywords: [
    // English
    'context:', 'background:', 'given that', 'scenario:',
    'setting:', 'situation:', 'overview:',
    // Chinese
    '背景：', '背景:', '上下文：', '上下文:', '场景：', '场景:',
    '情境：', '情境:', '环境：', '环境:', '概述：', '概述:',
  ],
  priority: 3,
};

// ============================================================================
// EXAMPLES PATTERNS
// ============================================================================

const examplesPattern: DetectionPattern = {
  name: 'examples',
  patterns: [
    // XML tags
    /^<examples?>([\s\S]*?)<\/examples?>/gim,
    /^<example>([\s\S]*?)<\/example>/gim,

    // English patterns
    /^examples?:\s*.+/gim,
    /^for example,?\s*.+/gim,
    /^for instance,?\s*.+/gim,
    /^e\.g\.?,?\s*.+/gim,
    /^such as[:：]?\s*.+/gim,
    /^sample[s]?:\s*.+/gim,
    /^instance[s]?:\s*.+/gim,
    /^demonstration[s]?:\s*.+/gim,
    /input:\s*.+\s+output:\s*.+/gim,
    /(?:^|\n)(?:\d+\.\s+)?input:\s*.+/gim,

    // Chinese patterns
    /^(?:举)?例如[:：、,，]?\s*.+/gim,
    /^(?:举)?例子[:：]?\s*.+/gim,
    /^示例[:：]\s*.+/gim,
    /^样例[:：]\s*.+/gim,
    /^比如[:：、,，]?\s*.+/gim,
    /^举例来说[:：、,，]?\s*.+/gim,
    /^例[:：]\s*.+/gim,
    /输入[:：]\s*.+\s+输出[:：]\s*.+/gim,
    /(?:^|\n)(?:\d+[、.．]\s+)?输入[:：]\s*.+/gim,
  ],
  keywords: [
    // English
    'example:', 'examples:', 'for example', 'for instance',
    'e.g.', 'such as', 'sample:', 'samples:', 'instance:',
    'input:', 'output:', 'demonstration:',
    // Chinese
    '例如', '举例', '比如', '示例：', '示例:', '样例：', '样例:',
    '举例来说', '例子：', '例子:', '例：', '例:',
    '输入：', '输入:', '输出：', '输出:',
  ],
  priority: 4,
};

// ============================================================================
// OUTPUT FORMAT PATTERNS
// ============================================================================

const outputFormatPattern: DetectionPattern = {
  name: 'outputFormat',
  patterns: [
    // XML tags
    /^<output[_\s]?format>([\s\S]*?)<\/output[_\s]?format>/im,
    /^<response[_\s]?format>([\s\S]*?)<\/response[_\s]?format>/im,

    // English patterns
    /^output format:\s*.+/im,
    /^response format:\s*.+/im,
    /^format (?:the output|your response) (?:as|in|using)\s+.+/im,
    /^return\s+.+\s+(?:as|in)\s+.+/im,
    /^provide (?:the )?result in\s+.+/im,
    /^structure your response (?:as|in)\s+.+/im,
    /^your (?:output|response) should be\s+.+/im,
    /^reply in\s+.+/im,
    /^answer in\s+.+/im,

    // Chinese patterns
    /^输出格式[:：]\s*.+/im,
    /^返回格式[:：]\s*.+/im,
    /^回答格式[:：]\s*.+/im,
    /^格式[:：]\s*.+/im,
    /^(?:请)?以.+格式(?:输出|返回|回答)/im,
    /^(?:请)?用.+格式(?:输出|返回|回答)/im,
    /^你的(?:输出|回答|返回)应该.+/im,
  ],
  keywords: [
    // English
    'output format:', 'response format:', 'format the output',
    'format your response', 'return', 'provide the result',
    'structure your response', 'reply in', 'answer in',
    // Chinese
    '输出格式：', '输出格式:', '返回格式：', '返回格式:',
    '回答格式：', '回答格式:', '格式：', '格式:',
    '输出', '返回', '回答',
  ],
  priority: 5,
};

// ============================================================================
// TASK / MAIN INSTRUCTION PATTERNS
// ============================================================================

const taskPattern: DetectionPattern = {
  name: 'task',
  patterns: [
    // XML tags
    /^<task>([\s\S]*?)<\/task>/im,
    /^<instruction>([\s\S]*?)<\/instruction>/im,

    // English patterns
    /^task:\s*.+/im,
    /^your task is\s+.+/im,
    /^please\s+(?:translate|analyze|generate|create|write|review|evaluate|summarize)\s+.+/im,
    /^(?:translate|analyze|generate|create|write|review|evaluate|summarize)\s+(?:the following|the|this)\s+.+/im,
    /^now,?\s+(?:please\s+)?(?:translate|analyze|generate|create)\s+.+/im,
    /^instruction:\s*.+/im,
    /^goal:\s*.+/im,
    /^objective:\s*.+/im,

    // Chinese patterns
    /^任务[:：]\s*.+/im,
    /^你的任务是.+/im,
    /^指令[:：]\s*.+/im,
    /^目标[:：]\s*.+/im,
    /^(?:请|现在请|请你)\s*(?:翻译|分析|生成|创建|写|评审|评估|总结|处理).+/im,
    /^(?:翻译|分析|生成|创建|写|评审|评估|总结|处理)\s*(?:以下|下面|如下|这个|这段).+/im,
    /^现在[,，]?\s*(?:请)?(?:翻译|分析|生成|创建).+/im,
  ],
  keywords: [
    // English
    'task:', 'your task', 'please', 'translate', 'analyze',
    'generate', 'create', 'write', 'review', 'evaluate',
    'instruction:', 'goal:', 'objective:',
    // Chinese
    '任务：', '任务:', '你的任务', '指令：', '指令:', '目标：', '目标:',
    '请', '请你', '翻译', '分析', '生成', '创建', '写', '评审', '评估',
    '总结', '处理', '现在',
  ],
  priority: 6,
};

/**
 * Complete set of enhanced detection patterns
 */
export const enhancedDetectionPatterns: DetectionPatterns = {
  introduction: introductionPattern,
  rules: rulesPattern,
  context: contextPattern,
  examples: examplesPattern,
  outputFormat: outputFormatPattern,
  task: taskPattern,
};
