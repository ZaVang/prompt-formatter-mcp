import { Template } from '../types/index.js';

/**
 * GPT Markdown Template
 * Based on GPT's preference for Markdown-formatted prompts
 */
export const gptMarkdownTemplate: Template = {
  name: 'gpt_markdown',
  description: 'Markdown-structured template optimized for GPT models',

  // Introduction section
  introduction: `# Role

{{content}}

`,

  // Rules section
  rulesStart: `## Rules

`,
  rulesEnd: `
`,
  ruleItem: `- {{content}}
`,

  // Context section
  contextSection: `## Context

{{content}}

`,

  // Examples section
  examplesStart: `## Examples

`,
  examplesEnd: `
`,
  exampleItem: `### Example

{{content}}

`,

  // Output format section
  outputSection: `## Output Format

{{content}}

`,

  // Task section
  taskSection: `## Task

{{content}}
`,
};

/**
 * GPT Markdown Template with numbered rules
 * Alternative style using numbered lists
 */
export const gptMarkdownNumberedTemplate: Template = {
  name: 'gpt_markdown_numbered',
  description: 'Markdown template with numbered rules and sections',

  introduction: `# Role

{{content}}

`,

  rulesStart: `## Rules

`,
  rulesEnd: `
`,
  ruleItem: `{{index}}. {{content}}
`,

  contextSection: `## Context

{{content}}

`,

  examplesStart: `## Examples

`,
  examplesEnd: `
`,
  exampleItem: `**Example {{index}}:**

{{content}}

`,

  outputSection: `## Output Format

{{content}}

`,

  taskSection: `## Task

{{content}}
`,
};
