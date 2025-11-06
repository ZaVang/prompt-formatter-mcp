#!/usr/bin/env node

/**
 * Standalone test script to verify core functionality
 * Run: npm run test:manual
 */

import('../dist/index.js').then(module => {
  const { ContentAnalyzer, TemplateEngine, ConventionValidator } = module;

  console.log('='.repeat(80));
  console.log('Prompt Formatter MCP - Manual Test');
  console.log('='.repeat(80));
  console.log();

  const testPrompt = `You are a professional translator specializing in English to Chinese translation.

Rules:
- Preserve all formatting tags
- Use natural, idiomatic expressions
- Ensure cultural appropriateness

Example:
Input: "Submit"
Output: "提交"

Output format: Return only the translated text

Task: Translate the following text.`;

  console.log('📝 Test Prompt:');
  console.log('-'.repeat(80));
  console.log(testPrompt);
  console.log('-'.repeat(80));
  console.log();

  // Test 1: Analyze
  console.log('🔍 TEST 1: Analyzing Prompt...');
  console.log('-'.repeat(80));
  const analyzer = new ContentAnalyzer();
  const analysis = analyzer.analyze(testPrompt, 'claude');

  console.log('✅ Detected Sections:');
  console.log('  - Introduction:', analysis.sections.introduction ? '✓' : '✗');
  console.log('  - Rules:', analysis.sections.rules.length, 'rules');
  console.log('  - Examples:', analysis.sections.examples.length, 'examples');
  console.log('  - Output Format:', analysis.sections.outputFormat ? '✓' : '✗');
  console.log('  - Task:', analysis.sections.task ? '✓' : '✗');
  console.log();

  console.log('📊 Quality Metrics:');
  console.log('  - Clarity Score:', (analysis.quality.clarityScore * 100).toFixed(1) + '%');
  console.log('  - Completeness Score:', (analysis.quality.completenessScore * 100).toFixed(1) + '%');
  console.log('  - Structure Score:', (analysis.quality.structureScore * 100).toFixed(1) + '%');
  console.log('  - Overall Score:', (analysis.quality.overallScore * 100).toFixed(1) + '%');
  console.log();

  if (analysis.suggestions.length > 0) {
    console.log('💡 Suggestions:');
    analysis.suggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });
    console.log();
  }

  // Test 2: Format to Claude XML
  console.log('🔧 TEST 2: Formatting to Claude XML...');
  console.log('-'.repeat(80));
  const templateEngine = new TemplateEngine();
  const claudeFormatted = templateEngine.render('claude_xml', analysis.sections);

  console.log('✅ Formatted Prompt (Claude XML):');
  console.log('-'.repeat(80));
  console.log(claudeFormatted);
  console.log('-'.repeat(80));
  console.log();

  // Test 3: Format to GPT Markdown
  console.log('🔧 TEST 3: Formatting to GPT Markdown...');
  console.log('-'.repeat(80));
  const gptFormatted = templateEngine.render('gpt_markdown', analysis.sections);

  console.log('✅ Formatted Prompt (GPT Markdown):');
  console.log(gptFormatted.substring(0, 400) + '...');
  console.log('-'.repeat(80));
  console.log();

  // Test 4: Validate conventions
  console.log('✔️  TEST 4: Validating Conventions...');
  console.log('-'.repeat(80));
  const validator = new ConventionValidator();
  const validation = validator.validate(testPrompt);

  console.log('📋 Validation Results:');
  console.log('  - Valid:', validation.isValid ? '✅ YES' : '❌ NO');
  console.log('  - Compliance Score:', (validation.complianceScore * 100).toFixed(1) + '%');
  console.log();

  console.log('✓ Checks Passed:', validation.checks.filter(c => c.passed).length, '/', validation.checks.length);
  validation.checks.forEach((check) => {
    const icon = check.passed ? '✅' : '❌';
    console.log(`  ${icon} ${check.check}`);
  });
  console.log();

  console.log('='.repeat(80));
  console.log('✅ All tests completed successfully!');
  console.log('='.repeat(80));
}).catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
