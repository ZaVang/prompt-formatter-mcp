# Prompt Formatter MCP Server

MCP server for intelligently formatting and optimizing prompts using rule-based analysis and structured templates to enhance LLM performance across different models.

## Core Philosophy

- **Convention over Configuration**: Follow our [writing conventions](./CONVENTIONS.md) for best results
- **Rule-Based Processing**: Fast, deterministic formatting without external LLM API calls
- **Agent Collaboration**: MCP handles structure, Agent handles intelligent optimization
- **Template-Driven**: Use default templates or bring your own

## Features

### ✅ Phase 1 (MVP - In Development)
- 🎯 **Smart Content Analysis**: Rule-based detection of prompt sections (introduction, rules, examples, etc.)
- 📝 **Default Templates**:
  - Claude XML format (with semantic tags like `<introduction>`, `<rules>`, `<section>`)
  - GPT Markdown format (with headers and structured lists)
  - JSON format for structured data
- 🔍 **Quality Analysis**: Evaluate prompt completeness and clarity
- ✅ **Convention Validation**: Check if prompts follow best practices
- 🎨 **Custom Templates**: Define your own template structure

### 🚧 Phase 2 (Planned)
- 📚 Template library with pre-built prompt patterns
- 🔄 Batch processing support
- 📊 Performance analytics

### 💭 Phase 3 (Future)
- 🧠 Learning from feedback
- 🌐 Web interface
- 🔌 VSCode extension

## MCP Tools

### 1. `format_prompt`
Format raw prompts into structured templates:
- Input: Raw prompt text
- Output: Formatted prompt in XML/Markdown/JSON/Custom format
- Features: Section detection, template application, confidence scoring

### 2. `analyze_prompt`
Analyze prompt quality and structure:
- Input: Raw prompt text
- Output: Detected sections, quality metrics, improvement suggestions
- Purpose: Returns analysis for Agent to use in optimization

### 3. `validate_prompt`
Validate prompt against writing conventions:
- Input: Raw prompt text
- Output: Compliance score, validation checks, recommendations
- Purpose: Help users write better prompts

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/ZaVang/prompt-formatter-mcp.git
cd prompt-formatter-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Setup with Claude Desktop

1. Edit your Claude Desktop configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the MCP server configuration:

```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/absolute/path/to/prompt-formatter-mcp/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

### Basic Usage

Once configured, you can use the MCP tools in Claude Desktop:

**Format a prompt:**
```
Please use the format_prompt tool to format this prompt:
"You are a translator. Rules: 1. Keep formatting 2. Use natural language. Task: Translate this text."
```

**Analyze a prompt:**
```
Please use the analyze_prompt tool to analyze this prompt and suggest improvements:
"Translate this to Chinese"
```

**Validate a prompt:**
```
Please use the validate_prompt tool to check if my prompt follows best practices:
"You are a translator..."
```

For detailed usage instructions, see [Usage Guide](./docs/USAGE.md)

## Documentation

### Getting Started
- 📖 [Usage Guide](./docs/USAGE.md) - Complete guide on installation, setup, and using all MCP tools
- ✍️ [Writing Conventions](./docs/CONVENTIONS.md) - **Start here!** Best practices for writing prompts
- 🚀 [Quick Start Guide](./docs/USAGE.md#installation) - Get up and running in minutes

### Architecture & Design
- 🏗️ [Design Document](./docs/DESIGN.md) - Detailed architecture and implementation plan
- 🔧 [MCP Architecture](./docs/MCP_ARCHITECTURE.md) - Understanding MCP server structure and patterns

### Advanced Topics
- 🎨 [Custom Templates](./docs/CUSTOM_TEMPLATES.md) - Create your own formatting templates
- 🧪 [Testing Guide](./docs/HOW_TO_TEST.md) - How to test the MCP server
- 📊 [LLM Optimization Guide](./docs/LLM_OPTIMIZATION_GUIDE.md) - Tips for optimizing prompts for different models

### Development
- ⚡ [Enhancement Summary](./docs/ENHANCEMENT_SUMMARY.md) - Recent improvements and features
- ✅ [Phase 1 Complete](./docs/PHASE1_COMPLETE.md) - MVP milestone achievements

## Why Prompt Formatter?

Different LLMs have different format preferences:
- **Claude** performs better with XML-structured prompts with semantic tags
- **GPT** models prefer Markdown with clear sections
- **All models** benefit from well-organized prompts with clear examples

This MCP server helps you:
1. Write prompts following best practices (see CONVENTIONS.md)
2. Automatically format them for your target model
3. Validate and improve prompt quality
4. Let the Agent optimize based on structured analysis

## Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Report Issues**: Found a bug? Have a feature request? [Open an issue](https://github.com/ZaVang/prompt-formatter-mcp/issues)
2. **Improve Documentation**: Help make our docs better
3. **Submit Pull Requests**: Fix bugs or add features
4. **Share Templates**: Create and share custom templates
5. **Provide Feedback**: Let us know how you're using the tool

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/prompt-formatter-mcp.git
cd prompt-formatter-mcp

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Pull Request Guidelines

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Write tests**: Add tests for new features
3. **Follow conventions**: Use Prettier and ESLint
4. **Update docs**: Update documentation if needed
5. **Write clear commits**: Use descriptive commit messages
6. **Submit PR**: Create a pull request with a clear description

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Run `npm run lint` before committing
- Run `npm run format` to format your code

### Testing

- Write unit tests for new features
- Ensure all tests pass: `npm test`
- Add integration tests when appropriate
- See [Testing Guide](./docs/HOW_TO_TEST.md) for details

### Questions?

Feel free to open an issue for questions or discussions!

## License

MIT License - see LICENSE file for details.

Copyright (c) 2024 Prompt Formatter MCP

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
