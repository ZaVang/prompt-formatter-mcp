# Sample Prompts for Testing

## Example 1: Basic Unformatted Prompt

```
You are a translator. Translate text from English to Chinese. Make sure to preserve formatting. Use natural language. Please translate: "Hello, world!"
```

## Example 2: Well-Formatted Prompt (Following Conventions)

```
You are a professional translator specializing in English to Chinese translation.

Rules:
- Preserve all formatting tags
- Use natural, idiomatic expressions
- Ensure cultural appropriateness

Example:
Input: "Submit"
Output: "提交"

Output format: Return only the translated text

Task: Translate the following text.
```

## Example 3: Complex Prompt with Context

```
You are an expert code reviewer with 10 years of experience.

Context: This is a pull request for a REST API service.

Rules:
- Check for security vulnerabilities
- Identify performance issues
- Suggest improvements for code quality
- Must follow PEP 8 style guide

Examples:
Example 1:
Input: SQL query without parameterization
Output: CRITICAL - SQL injection vulnerability detected

Example 2:
Input: Nested loops with O(n²) complexity
Output: PERFORMANCE - Consider using hash map for O(n) solution

Output format:
1. Issues found (with severity: high/medium/low)
2. Recommendations
3. Overall assessment

Task: Review the following code and provide feedback.
```

## Example 4: Poorly Structured Prompt

```
I need help translating some game dialogue. It's for a fantasy RPG. The target audience is Chinese players. Make it sound natural and keep the character's personality. Also don't translate names. Here's the dialogue: "Greetings, brave adventurer!"
```

## Example 5: XML-Tagged Prompt (Already Well-Structured)

```xml
<introduction>
You are a professional game translator specializing in English to Chinese translations.
</introduction>

<rules>
<rule>Preserve all HTML tags exactly as they appear</rule>
<rule>Use natural, idiomatic Chinese expressions</rule>
<rule>Do not translate character names</rule>
</rules>

<context>
This is a fantasy RPG game set in medieval times.
</context>

<examples>
<example>
Input: "Attack the dragon"
Output: "攻击巨龙"
</example>
</examples>

<output_format>
Return only the translated text enclosed in <result></result> tags
</output_format>

<task>
Translate the following dialogue.
</task>
```

## Expected Formatting Results

### Example 1 → Claude XML Format:
```xml
<introduction>
You are a translator.
</introduction>

<rules>
  <rule>Make sure to preserve formatting.</rule>
  <rule>Use natural language.</rule>
</rules>

<task>
Translate text from English to Chinese. Please translate: "Hello, world!"
</task>
```

### Example 2 → GPT Markdown Format:
```markdown
# Role

You are a professional translator specializing in English to Chinese translation.

## Rules

- Preserve all formatting tags
- Use natural, idiomatic expressions
- Ensure cultural appropriateness

## Examples

### Example

Input: "Submit"
Output: "提交"

## Output Format

Return only the translated text

## Task

Translate the following text.
```
