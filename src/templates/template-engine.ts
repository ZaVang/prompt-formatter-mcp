import {
  Template,
  DetectedSections,
  RenderOptions,
  CustomTemplate,
} from '../types/index.js';
import { claudeXmlTemplate } from './claude-xml.js';
import { gptMarkdownTemplate } from './gpt-markdown.js';
import { jsonTemplate } from './json-template.js';
import {
  customTemplateToTemplate,
  validateCustomTemplate,
} from './custom-template.js';

/**
 * TemplateEngine - Renders prompts using templates
 */
export class TemplateEngine {
  private templates: Map<string, Template>;

  constructor() {
    this.templates = new Map();
    this.registerDefaultTemplates();
  }

  /**
   * Register default templates
   */
  private registerDefaultTemplates() {
    this.templates.set('claude_xml', claudeXmlTemplate);
    this.templates.set('gpt_markdown', gptMarkdownTemplate);
    this.templates.set('json', jsonTemplate);
  }

  /**
   * Register a custom template
   */
  registerCustomTemplate(name: string, template: Template) {
    this.templates.set(name, template);
  }

  /**
   * Register a custom template from CustomTemplate definition
   */
  registerCustomTemplateFromDefinition(
    name: string,
    customTemplate: CustomTemplate
  ): { success: boolean; errors?: string[] } {
    const validation = validateCustomTemplate(customTemplate);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const template = customTemplateToTemplate(customTemplate, name);
    this.registerCustomTemplate(name, template);
    return { success: true };
  }

  /**
   * Get a template by name
   */
  getTemplate(name: string): Template | undefined {
    return this.templates.get(name);
  }

  /**
   * Render a prompt using a template
   */
  render(
    templateName: string,
    sections: DetectedSections,
    options?: RenderOptions
  ): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.renderWithTemplate(template, sections, options);
  }

  /**
   * Render using a specific template object
   */
  renderWithTemplate(
    template: Template,
    sections: DetectedSections,
    options?: RenderOptions
  ): string {
    const opts = {
      includeEmptySections: false,
      indentation: '',
      lineBreak: '\n',
      ...options,
    };

    let result = '';

    // Render introduction
    if (sections.introduction || opts.includeEmptySections) {
      result += this.renderSection(
        template.introduction || '',
        sections.introduction || '',
        opts
      );
    }

    // Render rules
    if (sections.rules.length > 0 || opts.includeEmptySections) {
      result += this.renderRules(template, sections.rules, opts);
    }

    // Render context
    if (sections.context || opts.includeEmptySections) {
      result += this.renderSection(
        template.contextSection || '',
        sections.context || '',
        opts
      );
    }

    // Render examples
    if (sections.examples.length > 0 || opts.includeEmptySections) {
      result += this.renderExamples(template, sections.examples, opts);
    }

    // Render output format
    if (sections.outputFormat || opts.includeEmptySections) {
      result += this.renderSection(
        template.outputSection || '',
        sections.outputFormat || '',
        opts
      );
    }

    // Render task
    if (sections.task || opts.includeEmptySections) {
      result += this.renderSection(
        template.taskSection || '',
        sections.task || '',
        opts
      );
    }

    return result;
  }

  /**
   * Render a single section
   */
  private renderSection(
    templateStr: string,
    content: string,
    options: RenderOptions
  ): string {
    if (!templateStr || !content) return '';

    let rendered = templateStr.replace(/\{\{content\}\}/g, content);

    // Apply custom variables if provided
    if (options.customVariables) {
      for (const [key, value] of Object.entries(options.customVariables)) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        rendered = rendered.replace(regex, value);
      }
    }

    return rendered;
  }

  /**
   * Render rules section
   */
  private renderRules(
    template: Template,
    rules: string[],
    options: RenderOptions
  ): string {
    if (rules.length === 0) return '';

    let result = template.rulesStart || '';

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const ruleItem = template.ruleItem || '{{content}}';
      let renderedRule = ruleItem.replace(/\{\{content\}\}/g, rule);

      // Support {{index}} placeholder for numbered items
      renderedRule = renderedRule.replace(/\{\{index\}\}/g, String(i + 1));

      result += renderedRule;
    }

    result += template.rulesEnd || '';

    return result;
  }

  /**
   * Render examples section
   */
  private renderExamples(
    template: Template,
    examples: Array<{ content: string; input?: string; output?: string }>,
    options: RenderOptions
  ): string {
    if (examples.length === 0) return '';

    let result = template.examplesStart || '';

    for (let i = 0; i < examples.length; i++) {
      const example = examples[i];
      const exampleItem = template.exampleItem || '{{content}}';

      let renderedExample = exampleItem.replace(
        /\{\{content\}\}/g,
        example.content
      );

      // Replace input/output if present
      if (example.input) {
        renderedExample = renderedExample.replace(
          /\{\{input\}\}/g,
          example.input
        );
      }
      if (example.output) {
        renderedExample = renderedExample.replace(
          /\{\{output\}\}/g,
          example.output
        );
      }

      // Support {{index}} placeholder
      renderedExample = renderedExample.replace(/\{\{index\}\}/g, String(i + 1));

      // Handle conditional blocks (simple implementation)
      renderedExample = this.handleConditionals(renderedExample, example);

      result += renderedExample;
    }

    result += template.examplesEnd || '';

    return result;
  }

  /**
   * Handle simple conditional blocks in templates
   */
  private handleConditionals(
    template: string,
    data: { input?: string; output?: string; [key: string]: any }
  ): string {
    let result = template;

    // Handle {{#if input}} ... {{/if}}
    const ifInputRegex = /\{\{#if input\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifInputRegex, (match, content) => {
      return data.input ? content : '';
    });

    // Handle {{#if output}} ... {{/if}}
    const ifOutputRegex = /\{\{#if output\}\}([\s\S]*?)\{\{\/if\}\}/g;
    result = result.replace(ifOutputRegex, (match, content) => {
      return data.output ? content : '';
    });

    return result;
  }

  /**
   * List available templates
   */
  listTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}
