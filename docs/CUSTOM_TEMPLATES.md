# Custom Templates Guide

## Overview

The Prompt Formatter MCP server supports custom templates, allowing you to define your own formatting styles beyond the built-in Claude XML, GPT Markdown, and JSON formats.

## What are Custom Templates?

Custom templates let you define exactly how each section of your prompt should be formatted. You provide template strings with placeholders, and the MCP server fills them with the detected content.

## Template Structure

A custom template is a JSON object with the following fields:

```typescript
{
  introduction?: string;        // How to format the role/introduction
  rules_section?: string;       // How to format the rules section container
  rule_item?: string;          // How to format each individual rule
  context_section?: string;     // How to format the context section
  examples_section?: string;    // How to format the examples section container
  example_item?: string;       // How to format each individual example
  output_section?: string;      // How to format the output format specification
  task_section?: string;        // How to format the main task
}
```

### Placeholders

Each field uses placeholders that will be replaced with actual content:

- `{{content}}` - The main content for that section
- `{{rules}}` - All rules combined (only in `rules_section`)
- `{{examples}}` - All examples combined (only in `examples_section`)

## Basic Example

Here's a simple custom template:

```json
{
  "introduction": "=== ROLE ===\n{{content}}\n\n",
  "rules_section": "=== RULES ===\n{{rules}}\n",
  "rule_item": "• {{content}}\n",
  "context_section": "=== CONTEXT ===\n{{content}}\n\n",
  "examples_section": "=== EXAMPLES ===\n{{examples}}\n",
  "example_item": "Example: {{content}}\n",
  "output_section": "=== OUTPUT FORMAT ===\n{{content}}\n\n",
  "task_section": "=== TASK ===\n{{content}}\n"
}
```

## Using Custom Templates

### In Claude Desktop

When using the `format_prompt` tool in Claude Desktop, specify `custom` as the target format and provide your template:

```
Please use the format_prompt tool with these parameters:
- prompt: "You are a translator. Rules: 1. Keep formatting 2. Use natural language. Task: Translate this text."
- targetFormat: "custom"
- customTemplate: {
    "introduction": "=== ROLE ===\n{{content}}\n\n",
    "rules_section": "=== RULES ===\n{{rules}}\n",
    "rule_item": "• {{content}}\n",
    "task_section": "=== TASK ===\n{{content}}\n"
  }
```

### Example Result

With the custom template above, the input prompt:

```
You are a translator.

Rules:
1. Keep formatting
2. Use natural language

Task: Translate this text.
```

Would be formatted as:

```
=== ROLE ===
You are a translator.

=== RULES ===
• Keep formatting
• Use natural language

=== TASK ===
Translate this text.
```

## Template Patterns

### Pattern 1: Simple Text with Headers

```json
{
  "introduction": "# Role\n{{content}}\n\n",
  "rules_section": "# Rules\n{{rules}}\n",
  "rule_item": "- {{content}}\n",
  "task_section": "# Task\n{{content}}\n"
}
```

### Pattern 2: Box-style Format

```json
{
  "introduction": "┌─ ROLE ─────────────────┐\n│ {{content}}\n└─────────────────────────┘\n\n",
  "rules_section": "┌─ RULES ────────────────┐\n{{rules}}└─────────────────────────┘\n\n",
  "rule_item": "│ ✓ {{content}}\n",
  "task_section": "┌─ TASK ─────────────────┐\n│ {{content}}\n└─────────────────────────┘\n"
}
```

### Pattern 3: Numbered Sections

```json
{
  "introduction": "1. ROLE\n   {{content}}\n\n",
  "rules_section": "2. RULES\n{{rules}}\n",
  "rule_item": "   - {{content}}\n",
  "examples_section": "3. EXAMPLES\n{{examples}}\n",
  "example_item": "   Example: {{content}}\n\n",
  "task_section": "4. TASK\n   {{content}}\n"
}
```

### Pattern 4: Minimal Format

```json
{
  "introduction": "{{content}}\n\n",
  "rules_section": "{{rules}}\n",
  "rule_item": "{{content}}\n",
  "task_section": "{{content}}\n"
}
```

### Pattern 5: Detailed Professional Format

```json
{
  "introduction": "╔═══ System Prompt ═══╗\n{{content}}\n╚═══════════════════╝\n\n",
  "rules_section": "╔═══ Guidelines ═══╗\n{{rules}}╚═══════════════════╝\n\n",
  "rule_item": "  ▸ {{content}}\n",
  "context_section": "╔═══ Context ═══╗\n{{content}}\n╚═══════════════════╝\n\n",
  "examples_section": "╔═══ Reference Examples ═══╗\n{{examples}}╚═══════════════════╝\n\n",
  "example_item": "  ➤ {{content}}\n\n",
  "output_section": "╔═══ Expected Output ═══╗\n{{content}}\n╚═══════════════════╝\n\n",
  "task_section": "╔═══ Primary Objective ═══╗\n{{content}}\n╚═══════════════════╝\n"
}
```

## Template Validation

The MCP server validates custom templates to ensure they're well-formed:

1. **Required Placeholders**: Certain fields must include specific placeholders:
   - `introduction`, `rule_item`, `example_item`, `output_section`, `task_section` must include `{{content}}`
   - `rules_section` should reference `{{rules}}`
   - `examples_section` should reference `{{examples}}`

2. **Error Handling**: If validation fails, you'll receive an error message indicating what's wrong

## Best Practices

### 1. Consistent Formatting
Use consistent delimiters and spacing throughout your template:

```json
{
  "introduction": "## Role\n{{content}}\n\n",
  "rules_section": "## Rules\n{{rules}}\n",
  "task_section": "## Task\n{{content}}\n"
}
```

### 2. Clear Section Separators
Make sections visually distinct:

```json
{
  "introduction": "─── ROLE ───\n{{content}}\n\n",
  "rules_section": "─── RULES ───\n{{rules}}\n",
  "task_section": "─── TASK ───\n{{content}}\n"
}
```

### 3. Include Whitespace
Add appropriate whitespace between sections:

```json
{
  "introduction": "{{content}}\n\n",
  "rules_section": "{{rules}}\n\n",
  "task_section": "{{content}}\n"
}
```

### 4. Model-Specific Templates
Create templates optimized for specific models:

**For Claude (XML-style):**
```json
{
  "introduction": "<system>\n{{content}}\n</system>\n\n",
  "rules_section": "<rules>\n{{rules}}</rules>\n\n",
  "rule_item": "<rule>{{content}}</rule>\n",
  "task_section": "<task>\n{{content}}\n</task>\n"
}
```

**For GPT (Markdown-style):**
```json
{
  "introduction": "# System\n{{content}}\n\n",
  "rules_section": "# Rules\n{{rules}}\n",
  "rule_item": "- {{content}}\n",
  "task_section": "# Task\n{{content}}\n"
}
```

## Advanced Usage

### Combining with Options

You can combine custom templates with formatting options:

```json
{
  "prompt": "Your prompt here",
  "targetFormat": "custom",
  "customTemplate": { /* your template */ },
  "options": {
    "preserveWhitespace": true,
    "includeMetadata": true
  }
}
```

### Template Libraries

Consider creating a library of templates for different use cases:

- `templates/technical.json` - For technical documentation
- `templates/creative.json` - For creative writing prompts
- `templates/analysis.json` - For data analysis tasks
- `templates/translation.json` - For translation tasks

### Reusable Templates

Store your frequently used templates and reference them:

```javascript
// Store commonly used templates
const myTemplates = {
  professional: { /* template definition */ },
  casual: { /* template definition */ },
  technical: { /* template definition */ }
};

// Use them
const result = format_prompt(prompt, 'custom', myTemplates.professional);
```

## Testing Your Templates

1. **Start Simple**: Begin with a basic template and test it
2. **Iterate**: Gradually add complexity
3. **Test Edge Cases**: Try prompts with missing sections
4. **Validate Output**: Ensure the formatted output looks good

### Testing Checklist

- [ ] Template validates successfully
- [ ] All sections render correctly
- [ ] Whitespace is appropriate
- [ ] Special characters display properly
- [ ] Works with minimal prompts
- [ ] Works with complex prompts
- [ ] Output is readable

## Common Issues

### Issue 1: Missing Placeholders

**Problem**: Template field doesn't include required placeholder

**Solution**: Ensure all fields include the appropriate placeholder:
```json
{
  "rule_item": "{{content}}\n"  // Must include {{content}}
}
```

### Issue 2: Excessive Whitespace

**Problem**: Too much whitespace between sections

**Solution**: Adjust newlines in your template:
```json
{
  "introduction": "{{content}}\n",  // One newline
  "rules_section": "{{rules}}"       // No trailing newline
}
```

### Issue 3: Inconsistent Formatting

**Problem**: Different sections use different styles

**Solution**: Use consistent delimiters and spacing:
```json
{
  "introduction": "=== Role ===\n{{content}}\n\n",
  "rules_section": "=== Rules ===\n{{rules}}\n",
  "task_section": "=== Task ===\n{{content}}\n"
}
```

## Template Reference

### Full Template Schema

```typescript
interface CustomTemplate {
  // Role/Introduction section
  introduction?: string;

  // Rules section container (use {{rules}} placeholder)
  rules_section?: string;

  // Individual rule item (use {{content}} placeholder)
  rule_item?: string;

  // Context/Background section
  context_section?: string;

  // Examples section container (use {{examples}} placeholder)
  examples_section?: string;

  // Individual example item (use {{content}} placeholder)
  example_item?: string;

  // Output format specification section
  output_section?: string;

  // Main task/instruction section
  task_section?: string;
}
```

### Default Template

If you don't specify certain fields, the system uses these defaults:

```json
{
  "introduction": "{{content}}\n",
  "rules_section": "{{rules}}\n",
  "rule_item": "{{content}}\n",
  "context_section": "{{content}}\n",
  "examples_section": "{{examples}}\n",
  "example_item": "{{content}}\n",
  "output_section": "{{content}}\n",
  "task_section": "{{content}}\n"
}
```

## Examples Gallery

See the [examples](../examples/) directory for more template examples:

- `examples/templates/professional.json` - Professional format
- `examples/templates/minimal.json` - Minimal format
- `examples/templates/creative.json` - Creative format
- `examples/templates/technical.json` - Technical format

## Need Help?

- Check the [Usage Guide](./USAGE.md) for general usage instructions
- Read the [Writing Conventions](./CONVENTIONS.md) to understand how sections are detected
- Open an [issue](https://github.com/ZaVang/prompt-formatter-mcp/issues) if you encounter problems

## Contributing Templates

Have a great template? Share it with the community! Submit a PR to add your template to the examples directory.
