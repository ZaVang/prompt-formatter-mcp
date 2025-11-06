# Usage Guide

## Installation

```bash
npm install
npm run build
```

## Running the MCP Server

### With Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/path/to/prompt-formatter-mcp/dist/index.js"]
    }
  }
}
```

Then restart Claude Desktop.

## Available Tools

### 1. format_prompt

Format a raw prompt into a structured template.

**Parameters:**
- `prompt` (required): The raw prompt text
- `targetFormat` (optional): Target format (`claude_xml`, `gpt_markdown`, `json`, `custom`). Default: `claude_xml`
- `customTemplate` (optional): Custom template definition (only when `targetFormat` is `custom`)
- `options` (optional):
  - `preserveWhitespace`: Preserve original whitespace (default: false)
  - `strictMode`: Fail if cannot detect required sections (default: false)
  - `includeMetadata`: Include metadata in response (default: false)

**Example:**
```javascript
{
  "prompt": "You are a translator. Rules: 1. Keep formatting 2. Use natural language. Task: Translate this text.",
  "targetFormat": "claude_xml"
}
```

**Response:**
```json
{
  "formattedPrompt": "<introduction>\nYou are a translator.\n</introduction>\n<rules>\n  <rule>Keep formatting</rule>\n  <rule>Use natural language.</rule>\n</rules>\n<task>\nTranslate this text.\n</task>\n",
  "detectedSections": {
    "introduction": true,
    "rules": 2,
    "examples": 0,
    "outputFormat": false,
    "task": true
  },
  "confidenceScore": 0.6,
  "warnings": [
    "No examples detected - adding examples can improve model performance",
    "No output format specification detected"
  ]
}
```

### 2. analyze_prompt

Analyze prompt structure and quality.

**Parameters:**
- `prompt` (required): The prompt to analyze
- `targetModel` (optional): Target model (`claude`, `gpt`, `generic`). Default: `generic`

**Example:**
```javascript
{
  "prompt": "Translate this text to Chinese",
  "targetModel": "claude"
}
```

**Response:**
```json
{
  "sections": {
    "introduction": null,
    "rules": [],
    "context": null,
    "examples": [],
    "outputFormat": null,
    "task": "Translate this text to Chinese"
  },
  "quality": {
    "clarityScore": 0.25,
    "completenessScore": 0.2,
    "structureScore": 0.2,
    "overallScore": 0.22
  },
  "issues": [
    {
      "type": "missing_content",
      "severity": "medium",
      "section": "introduction",
      "description": "No role or introduction section detected",
      "suggestion": "Add an introduction using 'You are...' or 'Act as...'"
    }
  ],
  "missingSections": ["introduction", "rules", "context", "examples", "outputFormat"],
  "suggestions": [
    "Add an introduction using 'You are...' or 'Act as...'",
    "Add rules using 'Rule:', 'Must', 'Should', or 'Always' keywords"
  ],
  "optimizationPrompt": "To improve this prompt for claude:\n\nClaude-specific recommendations:\n- Use XML tags for better structure..."
}
```

### 3. validate_prompt

Validate if a prompt follows recommended conventions.

**Parameters:**
- `prompt` (required): The prompt to validate

**Example:**
```javascript
{
  "prompt": "You are a translator.\n\nRule: Keep formatting\nRule: Use natural language\n\nTask: Translate this."
}
```

**Response:**
```json
{
  "isValid": true,
  "complianceScore": 0.83,
  "checks": [
    {
      "check": "Has clear role definition",
      "passed": true,
      "found": "You are a translator."
    },
    {
      "check": "Rules use standard markers",
      "passed": true,
      "found": "Standard rule markers detected"
    },
    {
      "check": "Uses blank lines to separate sections",
      "passed": true,
      "found": "Blank lines detected for section separation"
    }
  ],
  "recommendations": [
    "Good! Your prompt follows the recommended conventions"
  ]
}
```

## Custom Templates

You can define custom templates:

```javascript
{
  "prompt": "Your prompt here",
  "targetFormat": "custom",
  "customTemplate": {
    "introduction": "=== ROLE ===\n{{content}}\n\n",
    "rules_section": "=== RULES ===\n{{rules}}\n",
    "rule_item": "• {{content}}\n",
    "task_section": "=== TASK ===\n{{content}}\n"
  }
}
```

## Tips for Best Results

1. **Follow Conventions**: See [CONVENTIONS.md](../CONVENTIONS.md) for writing guidelines
2. **Use Standard Markers**: Use keywords like `Rule:`, `Example:`, `Task:` for better detection
3. **Separate Sections**: Use blank lines between different sections
4. **Add Examples**: Include 1-2 examples for better model performance
5. **Specify Output Format**: Always define expected output format

## Development

### Run in development mode:
```bash
npm run dev
```

### Run tests:
```bash
npm test
```

### Lint code:
```bash
npm run lint
```

### Format code:
```bash
npm run format
```
