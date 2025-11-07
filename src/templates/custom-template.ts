import { Template, CustomTemplate } from '../types/index.js';

/**
 * Convert custom template definition to Template object
 */
export function customTemplateToTemplate(
  custom: CustomTemplate,
  name: string = 'custom'
): Template {
  return {
    name,
    description: 'User-defined custom template',
    introduction: custom.introduction || '{{content}}\n',
    rulesStart: custom.rules_section
      ? custom.rules_section.split('{{rules}}')[0]
      : '',
    rulesEnd: custom.rules_section
      ? custom.rules_section.split('{{rules}}')[1] || ''
      : '',
    ruleItem: custom.rule_item || '{{content}}\n',
    contextSection: custom.context_section || '{{content}}\n',
    examplesStart: custom.examples_section
      ? custom.examples_section.split('{{examples}}')[0]
      : '',
    examplesEnd: custom.examples_section
      ? custom.examples_section.split('{{examples}}')[1] || ''
      : '',
    exampleItem: custom.example_item || '{{content}}\n',
    outputSection: custom.output_section || '{{content}}\n',
    taskSection: custom.task_section || '{{content}}\n',
  };
}

/**
 * Validate custom template
 */
export function validateCustomTemplate(custom: CustomTemplate): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required placeholders
  const checkPlaceholder = (field: string | undefined, fieldName: string) => {
    if (field && !field.includes('{{content}}')) {
      errors.push(`${fieldName} must include {{content}} placeholder`);
    }
  };

  checkPlaceholder(custom.introduction, 'introduction');
  checkPlaceholder(custom.rule_item, 'rule_item');
  checkPlaceholder(custom.example_item, 'example_item');
  checkPlaceholder(custom.output_section, 'output_section');
  checkPlaceholder(custom.task_section, 'task_section');

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a default custom template
 */
export function createDefaultCustomTemplate(): CustomTemplate {
  return {
    introduction: '{{content}}\n\n',
    rules_section: '{{rules}}\n',
    rule_item: '- {{content}}\n',
    context_section: '{{content}}\n\n',
    examples_section: '{{examples}}\n',
    example_item: '{{content}}\n',
    output_section: '{{content}}\n\n',
    task_section: '{{content}}\n',
  };
}
