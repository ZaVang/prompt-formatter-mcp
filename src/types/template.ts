import { DetectedSections } from './prompt.js';

/**
 * Template structure definition
 */
export interface Template {
  name: string;
  description?: string;
  base?: string;
  introduction?: string;
  rulesStart?: string;
  rulesEnd?: string;
  ruleItem?: string;
  contextSection?: string;
  examplesStart?: string;
  examplesEnd?: string;
  exampleItem?: string;
  outputSection?: string;
  taskSection?: string;
}

/**
 * Custom template definition (user-provided)
 */
export interface CustomTemplate {
  introduction?: string;
  rules_section?: string;
  rule_item?: string;
  context_section?: string;
  examples_section?: string;
  example_item?: string;
  output_section?: string;
  task_section?: string;
}

/**
 * Template type
 */
export type TemplateType = 'claude_xml' | 'gpt_markdown' | 'json' | 'custom';

/**
 * Options for template rendering
 */
export interface RenderOptions {
  includeEmptySections?: boolean;
  indentation?: string;
  lineBreak?: string;
  customVariables?: Record<string, string>;
}

/**
 * Context for template rendering
 */
export interface RenderContext {
  sections: DetectedSections;
  template: Template;
  options?: RenderOptions;
}

/**
 * Template registry entry
 */
export interface TemplateRegistryEntry {
  type: TemplateType;
  template: Template;
  description: string;
}
