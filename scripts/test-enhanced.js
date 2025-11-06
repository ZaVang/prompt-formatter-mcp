#!/usr/bin/env node

/**
 * Test script for enhanced pattern detection
 * Demonstrates:
 * 1. Chinese language support
 * 2. Colon-based segmentation
 * 3. Heuristic fallback
 */

import('../dist/index.js').then(async (module) => {
  const { ContentAnalyzer, HeuristicSegmenter } = module;

  console.log('='.repeat(80));
  console.log('Enhanced Pattern Detection Test');
  console.log('='.repeat(80));
  console.log();

  // Test 1: Chinese prompt with colon-based sections
  console.log('Test 1: Chinese prompt with colon-based sections');
  console.log('-'.repeat(80));

  const chinesePrompt = `你是一个专业的翻译助手，擅长中英文翻译。

规则: 必须准确翻译，不得增删内容
要求: 保持原文的语气和风格

举例来说:
输入: Hello world
输出: 你好世界

输出格式: 以JSON格式返回，包含原文和译文

现在请翻译以下文本：[待翻译内容]`;

  const analyzer = new ContentAnalyzer(true); // Use enhanced detector
  const result = analyzer.analyze(chinesePrompt, 'claude');

  console.log('Detected sections:');
  console.log('  Introduction:', result.sections.introduction ? '✓ Found' : '✗ Not found');
  console.log('  Rules:', result.sections.rules.length, 'rules detected');
  result.sections.rules.forEach((rule, i) => {
    console.log(`    ${i + 1}. ${rule.substring(0, 50)}...`);
  });
  console.log('  Examples:', result.sections.examples.length, 'examples detected');
  result.sections.examples.forEach((ex, i) => {
    console.log(`    ${i + 1}. ${ex.content.substring(0, 50)}...`);
  });
  console.log('  Output Format:', result.sections.outputFormat ? '✓ Found' : '✗ Not found');
  console.log('  Task:', result.sections.task ? '✓ Found' : '✗ Not found');
  console.log();
  console.log('Quality metrics:');
  console.log('  Overall score:', result.quality.overallScore.toFixed(2));
  console.log('  Clarity:', result.quality.clarityScore.toFixed(2));
  console.log('  Completeness:', result.quality.completenessScore.toFixed(2));
  console.log('  Structure:', result.quality.structureScore.toFixed(2));
  console.log();

  // Test 2: Unstructured prompt with only newlines
  console.log('Test 2: Unstructured prompt (heuristic fallback)');
  console.log('-'.repeat(80));

  const unstructuredPrompt = `你是一个数学助手

必须用JSON格式返回结果
计算要准确
不要有错误

比如输入5，输出25

现在计算42的平方`;

  const result2 = analyzer.analyze(unstructuredPrompt, 'claude');

  console.log('Detected sections:');
  console.log('  Introduction:', result2.sections.introduction ? '✓ Found' : '✗ Not found');
  console.log('  Rules:', result2.sections.rules.length, 'rules detected');
  result2.sections.rules.forEach((rule, i) => {
    console.log(`    ${i + 1}. ${rule}`);
  });
  console.log('  Examples:', result2.sections.examples.length, 'examples detected');
  console.log('  Task:', result2.sections.task ? '✓ Found' : '✗ Not found');
  console.log();

  // Test 3: Heuristic segmenter directly
  console.log('Test 3: Heuristic segmenter with colon format');
  console.log('-'.repeat(80));

  const colonPrompt = `角色: 你是翻译专家

规则: 准确翻译
要求: 保持风格

任务: 翻译文本`;

  const segmenter = new HeuristicSegmenter();
  const segments = segmenter.detectColonSections(colonPrompt);

  console.log(`Detected ${segments.length} colon-based segments:`);
  segments.forEach((seg, i) => {
    console.log(`  ${i + 1}. [${seg.metadata?.colonPrefix}] → ${seg.suggestedCategory}`);
    console.log(`     Content: ${seg.content.substring(0, 40)}...`);
    console.log(`     Confidence: ${seg.confidence.toFixed(2)}`);
  });
  console.log();

  // Test 4: English prompt (should still work)
  console.log('Test 4: English prompt (backward compatibility)');
  console.log('-'.repeat(80));

  const englishPrompt = `You are a professional translator.

Rules:
- Must translate accurately
- Preserve original tone

Examples:
Input: Hello world
Output: 你好世界

Task: Translate the following text.`;

  const result4 = analyzer.analyze(englishPrompt, 'gpt');

  console.log('Detected sections:');
  console.log('  Introduction:', result4.sections.introduction ? '✓ Found' : '✗ Not found');
  console.log('  Rules:', result4.sections.rules.length, 'rules detected');
  console.log('  Examples:', result4.sections.examples.length, 'examples detected');
  console.log('  Task:', result4.sections.task ? '✓ Found' : '✗ Not found');
  console.log();
  console.log('Quality score:', result4.quality.overallScore.toFixed(2));
  console.log();

  // Test 5: Optimization prompt generation
  console.log('Test 5: LLM Optimization Prompt Generation');
  console.log('-'.repeat(80));

  const poorPrompt = `翻译这段话`;

  const result5 = analyzer.analyze(poorPrompt, 'claude');

  console.log('Input prompt:', poorPrompt);
  console.log('Quality score:', result5.quality.overallScore.toFixed(2));
  console.log('Missing sections:', result5.missingSections.join(', '));
  console.log();
  console.log('Generated optimization prompt for Agent:');
  console.log('-'.repeat(80));
  console.log(result5.optimizationPrompt);
  console.log();

  console.log('='.repeat(80));
  console.log('All tests completed!');
  console.log('='.repeat(80));
}).catch((err) => {
  console.error('Error running tests:', err);
  process.exit(1);
});
