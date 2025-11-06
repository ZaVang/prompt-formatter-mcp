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

(Coming soon - project in development)

## Documentation

- [Design Document](./DESIGN.md) - Detailed architecture and implementation plan
- [Writing Conventions](./CONVENTIONS.md) - **Start here!** Learn how to write prompts for optimal recognition
- [API Documentation](./docs/API.md) - (Coming soon)
- [Usage Guide](./docs/USAGE.md) - (Coming soon)

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

(Coming soon)

## License

(TBD)
