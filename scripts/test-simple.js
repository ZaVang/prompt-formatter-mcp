#!/usr/bin/env node
console.log('Loading modules...');

import('../dist/index.js').then(async (module) => {
  const { FormatPromptTool, AnalyzePromptTool, ValidatePromptTool } = module;

  console.log('================================================================================');
  console.log('Prompt Formatter MCP - Simple Test');
  console.log('================================================================================\n');

  const testPrompt = "You are a translator. Rules: Keep formatting. Task: Translate this text.";
  console.log('Test Prompt:', testPrompt);
  console.log('\n' + '='.repeat(80) + '\n');

  // Test 1: Format
  console.log('1. Testing format_prompt tool...\n');
  const formatTool = new FormatPromptTool();
  try {
    const result = await formatTool.format(testPrompt, 'claude_xml', undefined, { includeMetadata: true });
    console.log('SUCCESS - Formatted Prompt:');
    console.log(result.formattedPrompt);
    console.log('\nConfidence Score:', result.confidenceScore.toFixed(2));
    console.log('Sections Detected:', result.metadata?.sectionsDetected);
  } catch (error) {
    console.error('FAILED:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 2: Analyze
  console.log('2. Testing analyze_prompt tool...\n');
  const analyzeTool = new AnalyzePromptTool();
  try {
    const result = await analyzeTool.analyze(testPrompt, 'claude');
    console.log('SUCCESS - Analysis:');
    console.log('Overall Score:', (result.quality.overallScore * 100).toFixed(1) + '%');
    console.log('Missing Sections:', result.missingSections.join(', '));
    console.log('Suggestions:', result.suggestions.slice(0, 2).join('; '));
  } catch (error) {
    console.error('FAILED:', error.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Test 3: Validate
  console.log('3. Testing validate_prompt tool...\n');
  const validateTool = new ValidatePromptTool();
  try {
    const result = await validateTool.validate(testPrompt);
    console.log('SUCCESS - Validation:');
    console.log('Is Valid:', result.isValid);
    console.log('Compliance Score:', (result.complianceScore * 100).toFixed(1) + '%');
    console.log('Passed Checks:', result.checks.filter(c => c.passed).length, '/', result.checks.length);
  } catch (error) {
    console.error('FAILED:', error.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('All tests completed!');
  console.log('='.repeat(80));

}).catch(err => {
  console.error('Error loading modules:', err);
  process.exit(1);
});
