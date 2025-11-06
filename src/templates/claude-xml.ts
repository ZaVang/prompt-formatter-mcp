import { Template } from '../types/index.js';

/**
 * Claude XML Template
 * Based on Claude's preference for XML-structured prompts with semantic tags
 * Inspired by real-world usage patterns
 */
export const claudeXmlTemplate: Template = {
  name: 'claude_xml',
  description:
    'XML-structured template optimized for Claude models with semantic tags',

  // Introduction section
  introduction: `<introduction>
{{content}}
</introduction>
`,

  // Rules section
  rulesStart: `<rules>
`,
  rulesEnd: `</rules>
`,
  ruleItem: `  <rule>{{content}}</rule>
`,

  // Context section
  contextSection: `<context>
{{content}}
</context>
`,

  // Examples section
  examplesStart: `<examples>
`,
  examplesEnd: `</examples>
`,
  exampleItem: `  <example>
{{content}}
  </example>
`,

  // Output format section
  outputSection: `<output_format>
{{content}}
</output_format>
`,

  // Task section
  taskSection: `<task>
{{content}}
</task>
`,
};

/**
 * Advanced Claude XML Template with sections
 * For more complex prompts with grouped rules
 */
export const claudeXmlAdvancedTemplate: Template = {
  name: 'claude_xml_advanced',
  description:
    'Advanced XML template with section grouping for complex prompts',

  introduction: `<introduction>
{{content}}
</introduction>
`,

  rulesStart: `<rules>
`,
  rulesEnd: `</rules>
`,

  // For advanced template, rules can be grouped in sections
  ruleItem: `  <rule>{{content}}</rule>
`,

  contextSection: `<context>
{{content}}
</context>
`,

  examplesStart: `<examples>
`,
  examplesEnd: `</examples>
`,
  exampleItem: `  <example>
    <description>{{description}}</description>
    {{#if input}}
    <input>{{input}}</input>
    {{/if}}
    {{#if output}}
    <output>{{output}}</output>
    {{/if}}
  </example>
`,

  outputSection: `<output_format>
{{content}}
</output_format>
`,

  taskSection: `<task>
{{content}}
</task>
`,
};
