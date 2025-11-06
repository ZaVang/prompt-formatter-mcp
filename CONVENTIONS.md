# Prompt编写规范与约定

## 目的

本规范定义了一套prompt编写约定，帮助MCP服务器更准确地识别和格式化您的prompt内容。遵循这些约定可以显著提升格式化的准确性和质量。

---

## 核心原则

> **约定大于配置** - 使用标准化的标记和关键词，让系统更容易理解您的意图

---

## 1. Prompt结构约定

推荐将prompt组织为以下几个清晰的部分：

```
[角色/身份介绍]
[规则和约束]
[上下文信息]
[示例]
[输出格式要求]
[主任务]
```

---

## 2. 各部分编写约定

### 2.1 角色/身份介绍 (Introduction)

**标记关键词**：
- `You are...`
- `Act as...`
- `Your role is...`
- `As a...`

**示例**：
```
✅ 推荐：
You are a professional game translator specializing in English to Chinese translations.

✅ 推荐：
Act as an expert Python developer with 10 years of experience.

❌ 不推荐：
I need help with translation.  （系统难以识别这是角色定义）
```

---

### 2.2 规则和约束 (Rules)

**标记关键词**：
- `Rule:` 或 `Rules:`
- `You must...` / `You should...`
- `Always...` / `Never...`
- `Do not...` / `Avoid...`
- `Ensure...` / `Make sure...`
- `Important:` / `Critical:`

**推荐格式**：
```
✅ 推荐：使用编号列表
Rules:
1. Preserve all formatting tags
2. Never translate code blocks
3. Always use professional tone

✅ 推荐：使用关键词前缀
Rule: Maintain the original paragraph structure
Rule: Translate all content within <source> tags

✅ 推荐：使用强调词
IMPORTANT: Do not add or remove any HTML tags
You must verify all translations for accuracy

❌ 不推荐：
Keep the format.  （不够明确）
```

**规则分组建议**：
```
✅ 推荐：按类别组织规则

Format Preservation Rules:
- Rule: Keep all <span> tags intact
- Rule: Maintain original line breaks

Translation Quality Rules:
- Rule: Use natural, idiomatic expressions
- Rule: Ensure cultural appropriateness
```

---

### 2.3 上下文信息 (Context)

**标记关键词**：
- `Context:`
- `Background:`
- `Given that...`
- `Scenario:`
- `Setting:`

**示例**：
```
✅ 推荐：
Context: This is a fantasy RPG game set in medieval times.

✅ 推荐：
Background: The user is building a REST API for an e-commerce platform.

✅ 推荐：
Given that the target audience is non-technical users, simplify explanations.

❌ 不推荐：
This is for a game.  （不够具体）
```

---

### 2.4 示例 (Examples)

**标记关键词**：
- `Example:` / `Examples:`
- `For example,`
- `Sample:` / `Samples:`
- `Instance:`
- `E.g.`

**推荐格式**：
```
✅ 推荐：明确的示例结构
Example:
Input: "Hello, world!"
Output: "你好，世界！"

✅ 推荐：多个示例
Examples:
1. Input: "Submit" → Output: "提交"
2. Input: "Cancel" → Output: "取消"

✅ 推荐：使用标记
For example, translate "Settings" as "设置", not "设定"

❌ 不推荐：
Like "Hello" becomes "你好"  （格式不清晰）
```

---

### 2.5 输出格式要求 (Output Format)

**标记关键词**：
- `Output format:` / `Response format:`
- `Format the output as...`
- `Return...`
- `Provide the result in...`
- `Structure your response as...`

**示例**：
```
✅ 推荐：
Output format: Return each translation enclosed in <result></result> tags

✅ 推荐：
Format the output as JSON with keys: "original", "translated", "confidence"

✅ 推荐：
Return your response in the following structure:
1. Summary
2. Detailed analysis
3. Recommendations

❌ 不推荐：
Give me the answer in a good way  （过于模糊）
```

---

### 2.6 主任务 (Main Task)

**标记关键词**：
- `Task:` / `Your task is...`
- `Please...`
- `Translate...`
- `Analyze...`
- `Generate...`
- `Create...`

**推荐位置**：放在prompt的**末尾**，在所有规则和说明之后

**示例**：
```
✅ 推荐：
Task: Translate the following game dialogue into Chinese.

✅ 推荐：
Please analyze the code below and identify potential security vulnerabilities.

✅ 推荐：
Your task is to generate unit tests for the following function.

❌ 不推荐：
Do this  （不具体）
```

---

## 3. 结构化标记（可选但推荐）

如果您已经在使用结构化标记（如XML或Markdown），系统会优先识别这些标记：

### 3.1 XML风格
```xml
<introduction>
You are a professional translator.
</introduction>

<rules>
<rule>Preserve all formatting</rule>
<rule>Use natural language</rule>
</rules>

<examples>
<example>
Input: "Submit"
Output: "提交"
</example>
</examples>
```

### 3.2 Markdown风格
```markdown
# Role
You are a professional translator.

## Rules
1. Preserve all formatting
2. Use natural language

## Examples
- Input: "Submit" → Output: "提交"
```

---

## 4. 分段和空行

**推荐做法**：
- 使用**空行**分隔不同的部分
- 每个规则占一行
- 示例之间使用空行

```
✅ 推荐：
You are a translator.

Rules:
1. Keep formatting
2. Use natural language

Examples:
- "Hello" → "你好"

Task: Translate the text below.

❌ 不推荐：
You are a translator. Rules: 1. Keep formatting 2. Use natural language Examples: "Hello" → "你好" Task: Translate the text below.
```

---

## 5. 关键词大小写

**建议**：
- 使用 `Rule:`, `Example:`, `Task:` 等首字母大写的关键词
- 强调时可以全大写：`IMPORTANT:`, `NOTE:`

---

## 6. 复杂Prompt组织建议

对于复杂的prompt，推荐使用**分层结构**：

```
✅ 推荐：分层组织

You are a professional game translator.

Translation Rules:
1. Quality rules:
   - Use natural expressions
   - Ensure cultural appropriateness
2. Format rules:
   - Preserve all tags
   - Maintain structure

Context: This is a fantasy RPG game.

Examples:
Example 1:
Input: "Attack the dragon"
Output: "攻击巨龙"

Output format: Use <result></result> tags

Task: Translate the following dialogue.
```

---

## 7. 避免的常见问题

### ❌ 过于口语化
```
❌ 不好：
Hey, I need you to help me translate this stuff, and make it sound natural, okay?

✅ 更好：
You are a professional translator.
Rule: Ensure natural, idiomatic translations.
Task: Translate the following text.
```

### ❌ 规则和任务混在一起
```
❌ 不好：
Translate this text and make sure to keep the format and don't add tags.

✅ 更好：
Rules:
1. Preserve original format
2. Do not add or remove tags

Task: Translate the following text.
```

### ❌ 缺少明确的输出要求
```
❌ 不好：
Just give me the translation.

✅ 更好：
Output format: Return only the translated text without explanations.
```

---

## 8. 快速检查清单

在发送prompt前，检查：

- [ ] 是否有明确的角色/身份定义？
- [ ] 规则是否使用了关键词（Rule:, Must, Always等）？
- [ ] 是否使用了空行分隔不同部分？
- [ ] 示例是否清晰标记（Example:）？
- [ ] 输出格式要求是否明确？
- [ ] 主任务是否清晰且位于合适的位置？

---

## 9. 实际案例对比

### 案例1：代码审查

**❌ 未遵循约定**：
```
Look at this code and tell me what's wrong. Make sure to check for bugs and security issues. Give me suggestions too.
```

**✅ 遵循约定**：
```
You are an expert code reviewer specializing in security and best practices.

Rules:
1. Identify potential bugs and logic errors
2. Check for security vulnerabilities
3. Suggest improvements for code quality

Output format:
1. Issues found (with severity: high/medium/low)
2. Recommendations

Task: Review the following code.
```

### 案例2：翻译任务

**❌ 未遵循约定**：
```
Translate to Chinese, keep the HTML, be natural
```

**✅ 遵循约定**：
```
You are a professional translator specializing in English to Chinese translation.

Rules:
1. Preserve all HTML tags exactly as they appear
2. Use natural, idiomatic Chinese expressions
3. Maintain the original text structure

Output format: Return only the translated text

Task: Translate the following content.
```

---

## 10. 高级提示

### 10.1 使用section分组（适用于复杂prompt）

```
Section: Character Context
Background: The speaker is a young knight.
Tone: Formal and respectful.

Section: Translation Rules
Rule: Use archaic language where appropriate
Rule: Maintain honorifics

Section: Output
Format: <result></result> tags
```

### 10.2 优先级标记

```
Rules:
[CRITICAL] Never translate code blocks
[IMPORTANT] Preserve formatting
[OPTIONAL] Add explanatory comments where helpful
```

---

## 总结

遵循这些约定，您的prompt将会：
- ✅ 更容易被系统准确识别和格式化
- ✅ 结构更清晰，维护性更好
- ✅ 在不同模型间移植更容易
- ✅ 获得更好的执行效果

**记住**：一致性和清晰性是关键！

---

**相关文档**：
- [设计文档](./DESIGN.md)
- [API文档](./docs/API.md)
- [使用示例](./examples/)

**版本**: 1.0
**最后更新**: 2025-11-05
