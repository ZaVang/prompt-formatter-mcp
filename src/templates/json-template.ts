import { Template } from '../types/index.js';

/**
 * JSON Template
 * For prompts that need to be in JSON format
 */
export const jsonTemplate: Template = {
  name: 'json',
  description: 'JSON-structured template for schema-based prompts',

  // JSON templates are handled differently - this is more of a structure guide
  base: `{
  "prompt": {
    {{sections}}
  }
}`,

  introduction: `"introduction": "{{content}}"`,

  rulesStart: `"rules": [
`,
  rulesEnd: `
  ]`,
  ruleItem: `    "{{content}}"`,

  contextSection: `"context": "{{content}}"`,

  examplesStart: `"examples": [
`,
  examplesEnd: `
  ]`,
  exampleItem: `    {
      "content": "{{content}}"{{#if input}},
      "input": "{{input}}"{{/if}}{{#if output}},
      "output": "{{output}}"{{/if}}
    }`,

  outputSection: `"output_format": "{{content}}"`,

  taskSection: `"task": "{{content}}"`,
};
