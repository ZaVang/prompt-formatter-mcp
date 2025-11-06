# Prompt Formatter MCP Server - 设计文档

## 1. 项目概述

### 1.1 项目目标
创建一个MCP（Model Context Protocol）服务，用于智能格式化和优化用户的prompt，使其更符合不同LLM模型的偏好，从而提高模型的指令遵循能力和输出质量。

### 1.2 核心理念
- **单一职责**：专注于prompt格式化和优化
- **模块化设计**：避免代码耦合，便于维护和扩展
- **模型适配**：针对不同模型的特性进行优化
- **用户友好**：提供简单易用的API接口
- **约定大于配置**：提供编写规范，提升识别准确率
- **Agent协作**：MCP负责结构化，Agent负责智能优化

## 2. 核心功能

### 2.0 约定和规范系统

为了提升识别准确率，系统基于**约定大于配置**的原则：

#### 编写规范 (详见 CONVENTIONS.md)
- 提供标准化的关键词和标记（如 `Rule:`, `Example:`, `Task:` 等）
- 建议使用分段和空行分隔不同部分
- 推荐的结构顺序：角色介绍 → 规则 → 上下文 → 示例 → 输出格式 → 任务

#### 规则识别引擎
- **基于模式匹配**：使用正则表达式和关键词识别
- **优先级系统**：结构化标记（XML/Markdown）> 关键词标记 > 启发式推断
- **容错机制**：即使未完全遵循约定，也能尽力识别

#### 优势
- ✅ 用户遵循约定 → 高准确率识别
- ✅ 无需调用外部LLM API → 快速响应
- ✅ 确定性输出 → 可预测的结果
- ✅ 降低成本 → 无API调用费用

### 2.1 格式转换器 (Formatters)
- **Markdown Formatter**: 适用于GPT系列模型
  - 支持标题、列表、代码块等结构化元素
  - 自动识别和优化prompt中的章节

- **XML Formatter**: 适用于Claude系列模型
  - 使用语义化的XML标签（如`<instruction>`, `<context>`, `<examples>`）
  - 支持嵌套结构，清晰表达层级关系

- **JSON Formatter**: 适用于需要结构化数据的场景
  - 将prompt转换为JSON格式
  - 支持自定义schema

- **YAML Formatter**: 简洁的配置式格式
  - 适合配置型prompt
  - 易于人类阅读和编辑

### 2.2 内容分析器 (Analyzer)

**职责**：分析prompt结构，返回结构化信息给Agent

- **结构分析**: 自动识别prompt中的关键组成部分
  - 角色/身份介绍 (Introduction)
  - 规则和约束 (Rules)
  - 上下文信息 (Context)
  - 示例 (Examples)
  - 输出格式要求 (Output Format)
  - 主任务 (Main Task)

- **质量评估**: 评估prompt的完整性和清晰度
  - 缺失的section识别
  - 歧义检测
  - 结构问题标记

- **优化建议**: 生成改进建议返回给Agent
  - 建议添加的内容（如缺少示例）
  - 建议重组的部分
  - 清晰度改进提示

**工作流程**：
```
User Prompt → Analyzer → Structured Analysis
                              ↓
                         Return to Agent
                              ↓
                    Agent使用LLM能力优化
```

### 2.3 模板系统 (Template System)

#### 默认模板
提供开箱即用的标准模板（基于实际最佳实践）：

**Claude XML模板**：
- 使用语义化XML标签：`<introduction>`, `<rules>`, `<section>`, `<example>`, `<task>`
- 支持嵌套的`<rule>`结构
- 清晰的层级关系

**GPT Markdown模板**：
- 使用Markdown标题和列表
- 层次结构：`# Role`, `## Rules`, `## Examples`, `## Task`
- 适合GPT系列模型的格式偏好

**JSON模板**：
- 结构化的键值对
- 适合需要严格schema的场景

#### 自定义模板
用户可以提供自己的模板定义：

```typescript
interface CustomTemplate {
  base?: string;              // 基础结构
  introduction?: string;      // 角色介绍部分的模板
  rules_section?: string;     // 规则section模板
  rule_item?: string;         // 单条规则的模板
  examples_section?: string;  // 示例section模板
  output_section?: string;    // 输出格式section模板
  task_section?: string;      // 任务section模板
}
```

#### 模板应用流程
```
Raw Prompt → Analyzer → Detected Sections
                              ↓
                        Template Engine
                              ↓
                    Apply Template (默认或自定义)
                              ↓
                      Formatted Prompt
```

## 3. 可扩展功能

### 3.1 未来功能（Phase 2）
- **模板库**: 预定义的prompt模板
  - 代码生成模板
  - 数据分析模板
  - 创意写作模板
  - 技术文档模板

- **Prompt验证器**: 检查prompt质量
  - 完整性检查
  - 歧义检测
  - 长度优化建议

- **多语言支持**: 支持非英语prompt的优化

- **A/B测试支持**: 生成多个版本供比较

### 3.2 高级功能（Phase 3）
- **学习优化**: 基于用户反馈改进格式化策略
- **协作功能**: prompt版本管理和分享
- **性能分析**: 追踪不同格式的效果
- **批量处理**: 批量优化多个prompt

## 4. 技术栈

### 4.1 核心技术
- **运行时**: Node.js (v18+)
- **语言**: TypeScript 5.x
- **MCP SDK**: @modelcontextprotocol/sdk
- **构建工具**: tsup / esbuild
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier

### 4.2 关键依赖
```json
{
  "@modelcontextprotocol/sdk": "^1.0.0",
  "zod": "^3.22.0",           // schema验证
  "js-yaml": "^4.1.0",        // YAML解析
  "xml2js": "^0.6.0",         // XML处理
  "markdown-it": "^14.0.0"    // Markdown解析
}
```

## 5. 项目架构

### 5.1 目录结构
```
prompt-formatter-mcp/
├── src/
│   ├── index.ts                 # MCP服务器入口
│   ├── server.ts                # 服务器核心逻辑
│   ├── types/                   # TypeScript类型定义
│   │   ├── index.ts
│   │   ├── prompt.ts            # Prompt相关类型
│   │   ├── template.ts          # 模板相关类型
│   │   └── analysis.ts          # 分析结果类型
│   ├── analyzer/                # 内容分析器（规则引擎）
│   │   ├── index.ts
│   │   ├── patterns.ts          # 正则规则和关键词定义
│   │   ├── section-detector.ts  # Section检测器
│   │   ├── content-analyzer.ts  # 内容分析器主类
│   │   └── quality-evaluator.ts # 质量评估器
│   ├── templates/               # 模板系统
│   │   ├── index.ts
│   │   ├── claude-xml.ts        # Claude XML模板
│   │   ├── gpt-markdown.ts      # GPT Markdown模板
│   │   ├── json-template.ts     # JSON模板
│   │   ├── custom-template.ts   # 自定义模板处理
│   │   └── template-engine.ts   # 模板渲染引擎
│   ├── formatters/              # 格式化器（应用模板）
│   │   ├── index.ts
│   │   ├── base-formatter.ts    # 基础格式化器
│   │   └── template-formatter.ts # 基于模板的格式化器
│   ├── validators/              # 验证器
│   │   ├── index.ts
│   │   ├── convention-validator.ts  # 规范验证器
│   │   └── schema-validator.ts      # Schema验证器
│   ├── tools/                   # MCP工具定义
│   │   ├── index.ts
│   │   ├── format-prompt.ts     # format_prompt工具
│   │   ├── analyze-prompt.ts    # analyze_prompt工具
│   │   └── validate-prompt.ts   # validate_prompt工具
│   ├── resources/               # MCP资源（Phase 2）
│   │   └── index.ts
│   └── utils/                   # 工具函数
│       ├── logger.ts
│       ├── text-utils.ts        # 文本处理工具
│       └── score-calculator.ts  # 评分计算
├── tests/                       # 测试文件
│   ├── formatters/
│   ├── optimizers/
│   └── adapters/
├── examples/                    # 使用示例
│   └── sample-prompts.md
├── docs/                        # 文档
│   ├── API.md
│   └── USAGE.md
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── README.md
└── DESIGN.md
```

### 5.2 核心类设计

#### ContentAnalyzer (内容分析器)
```typescript
class ContentAnalyzer {
  private sectionDetector: SectionDetector;
  private qualityEvaluator: QualityEvaluator;

  // 分析prompt结构
  analyze(prompt: string): AnalysisResult {
    const sections = this.sectionDetector.detect(prompt);
    const quality = this.qualityEvaluator.evaluate(sections);
    const suggestions = this.generateSuggestions(sections, quality);

    return { sections, quality, suggestions };
  }
}
```

#### SectionDetector (Section检测器)
```typescript
class SectionDetector {
  private patterns: DetectionPatterns;

  // 检测各个section
  detect(prompt: string): DetectedSections {
    return {
      introduction: this.detectIntroduction(prompt),
      rules: this.detectRules(prompt),
      context: this.detectContext(prompt),
      examples: this.detectExamples(prompt),
      outputFormat: this.detectOutputFormat(prompt),
      task: this.detectTask(prompt)
    };
  }

  // 使用正则和关键词检测特定section
  private detectIntroduction(text: string): string | null;
  private detectRules(text: string): string[];
  // ...
}
```

#### TemplateEngine (模板渲染引擎)
```typescript
class TemplateEngine {
  // 应用模板到检测到的sections
  render(
    template: Template,
    sections: DetectedSections,
    options?: RenderOptions
  ): string {
    let result = '';

    if (sections.introduction && template.introduction) {
      result += this.renderSection(template.introduction, sections.introduction);
    }

    if (sections.rules.length > 0 && template.rules_section) {
      result += this.renderRules(template, sections.rules);
    }

    // ...

    return result;
  }
}
```

#### ConventionValidator (规范验证器)
```typescript
class ConventionValidator {
  // 验证prompt是否遵循编写规范
  validate(prompt: string): ValidationResult {
    const checks = [
      this.checkRoleDefinition(prompt),
      this.checkRuleMarkers(prompt),
      this.checkExampleMarkers(prompt),
      this.checkSectionSeparation(prompt),
      this.checkOutputFormat(prompt)
    ];

    const score = this.calculateScore(checks);
    const recommendations = this.generateRecommendations(checks);

    return { checks, score, recommendations };
  }
}
```

## 6. MCP API 设计

### 6.1 Tools（工具）

#### Tool 1: format_prompt
**核心功能**：使用规则引擎格式化prompt到指定格式

```typescript
{
  name: "format_prompt",
  description: "Format a raw prompt into a structured format (XML for Claude, Markdown for GPT, or custom template)",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The raw prompt text to format"
      },
      targetFormat: {
        type: "string",
        enum: ["claude_xml", "gpt_markdown", "json", "custom"],
        description: "Target format template",
        default: "claude_xml"
      },
      customTemplate: {
        type: "object",
        description: "Custom template definition (only when targetFormat is 'custom')",
        properties: {
          introduction: { type: "string" },
          rules_section: { type: "string" },
          rule_item: { type: "string" },
          examples_section: { type: "string" },
          output_section: { type: "string" },
          task_section: { type: "string" }
        }
      },
      options: {
        type: "object",
        properties: {
          preserveWhitespace: {
            type: "boolean",
            default: false,
            description: "Preserve original whitespace"
          },
          strictMode: {
            type: "boolean",
            default: false,
            description: "Fail if cannot detect required sections"
          }
        }
      }
    },
    required: ["prompt"]
  }
}
```

**返回示例**：
```json
{
  "formatted_prompt": "<introduction>You are a translator...</introduction><rules>...",
  "detected_sections": {
    "introduction": true,
    "rules": 5,
    "examples": 2,
    "output_format": true,
    "task": true
  },
  "confidence_score": 0.85,
  "warnings": ["No examples detected - consider adding examples for clarity"]
}
```

#### Tool 2: analyze_prompt
**核心功能**：分析prompt结构，返回诊断信息给Agent优化

```typescript
{
  name: "analyze_prompt",
  description: "Analyze prompt structure and quality, return suggestions for Agent to optimize",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The prompt to analyze"
      },
      targetModel: {
        type: "string",
        enum: ["claude", "gpt", "generic"],
        description: "Target LLM model for optimization suggestions",
        default: "generic"
      }
    },
    required: ["prompt"]
  }
}
```

**返回示例**：
```json
{
  "analysis": {
    "detected_sections": {
      "introduction": "You are a translator",
      "rules": ["Rule 1", "Rule 2"],
      "context": null,
      "examples": [],
      "output_format": "Use <result> tags",
      "task": "Translate the text below"
    },
    "quality_metrics": {
      "clarity_score": 0.7,
      "completeness_score": 0.6,
      "structure_score": 0.8
    },
    "missing_sections": ["context", "examples"],
    "issues": [
      {
        "type": "missing_content",
        "severity": "medium",
        "section": "examples",
        "description": "No examples provided - may reduce model performance"
      }
    ]
  },
  "suggestions": [
    "Add 1-2 examples to illustrate the expected translation style",
    "Consider adding context about the domain (e.g., technical, casual)",
    "The task section is clear and well-defined"
  ],
  "optimization_prompt": "To improve this prompt for Claude:\n1. Add context about the translation domain\n2. Include 2-3 examples showing input/output pairs\n3. Consider adding more specific rules about tone and style"
}
```

#### Tool 3: validate_prompt
**核心功能**：验证prompt是否遵循编写规范

```typescript
{
  name: "validate_prompt",
  description: "Validate if a prompt follows the recommended conventions (see CONVENTIONS.md)",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The prompt to validate"
      }
    },
    required: ["prompt"]
  }
}
```

**返回示例**：
```json
{
  "is_valid": false,
  "compliance_score": 0.65,
  "checks": [
    {
      "check": "Has clear role definition",
      "passed": true,
      "found": "You are a translator"
    },
    {
      "check": "Rules use standard markers",
      "passed": false,
      "suggestion": "Use 'Rule:', 'Must', 'Always' keywords for better recognition"
    },
    {
      "check": "Examples are marked clearly",
      "passed": false,
      "suggestion": "Use 'Example:' or 'For example,' to mark examples"
    }
  ],
  "recommendations": [
    "Add 'Rule:' prefix to each rule for better detection",
    "Mark examples explicitly with 'Example:' keyword",
    "Add blank lines between different sections"
  ]
}
```

### 6.2 Resources（资源 - Phase 2）
```typescript
// 示例模板资源
{
  uri: "template://code-generation",
  name: "Code Generation Template",
  mimeType: "text/plain"
}
```

### 6.3 Prompts（提示模板 - Phase 2）
```typescript
// 预定义prompt模板
{
  name: "create-api-documentation",
  description: "Generate API documentation from code"
}
```

## 7. 实现计划

### Phase 1: 核心功能（MVP）
**目标**: 实现基于规则的格式化和分析功能

#### 阶段1.1: 项目基础（第1周）
1. **项目初始化**
   - 设置TypeScript + Node.js环境
   - 配置MCP SDK (@modelcontextprotocol/sdk)
   - 建立目录结构
   - 配置测试框架（Vitest）
   - 设置ESLint + Prettier

2. **类型定义**
   - 定义核心类型（types/）
   - DetectedSections, AnalysisResult, Template等

#### 阶段1.2: 规则引擎（第2周）
3. **实现内容分析器**
   - patterns.ts - 定义正则规则和关键词
   - section-detector.ts - 实现section检测逻辑
   - content-analyzer.ts - 主分析类
   - quality-evaluator.ts - 质量评估器

4. **单元测试**
   - 测试各种prompt格式的识别准确率
   - 边界情况测试

#### 阶段1.3: 模板系统（第3周）
5. **实现默认模板**
   - claude-xml.ts - Claude XML模板
   - gpt-markdown.ts - GPT Markdown模板
   - template-engine.ts - 渲染引擎

6. **自定义模板支持**
   - custom-template.ts - 自定义模板处理

#### 阶段1.4: MCP工具集成（第4周）
7. **实现MCP工具**
   - format-prompt.ts - format_prompt工具
   - analyze-prompt.ts - analyze_prompt工具
   - validate-prompt.ts - validate_prompt工具

8. **集成到MCP Server**
   - server.ts - MCP服务器核心
   - 工具注册和请求处理

#### 阶段1.5: 测试和文档（第5周）
9. **完善测试**
   - 端到端测试
   - 集成测试
   - 示例测试

10. **文档编写**
    - API文档（docs/API.md）
    - 使用指南（docs/USAGE.md）
    - 示例（examples/）

### Phase 2: 扩展功能（第6-8周）
- JSON模板完善
- 更多模型适配（Gemini, etc.）
- 模板库Resources实现
- 批量格式化支持
- 性能优化

### Phase 3: 高级功能（第9-12周）
- 学习和反馈系统
- 性能分析工具
- Web界面（可选）
- VSCode插件（可选）

## 8. 质量保证

### 8.1 测试策略
- **单元测试**: 覆盖率 >80%
- **集成测试**: 测试MCP工具的端到端流程
- **示例测试**: 确保文档中的示例可运行

### 8.2 代码质量
- TypeScript严格模式
- ESLint规则强制执行
- Prettier自动格式化
- 代码审查清单

### 8.3 性能目标
- 格式化操作: <100ms (1KB prompt)
- 优化操作: <500ms (1KB prompt)
- 内存占用: <50MB (idle)

## 9. 部署和使用

### 9.1 本地开发
```bash
npm install
npm run dev
```

### 9.2 与Claude Desktop集成
在Claude Desktop配置中添加：
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

### 9.3 发布
- NPM包发布
- 提供安装脚本
- Docker镜像（可选）

## 10. 成功指标

- ✅ 支持至少3种格式（Markdown, XML, JSON）
- ✅ 成功适配Claude和GPT模型
- ✅ 测试覆盖率>80%
- ✅ 文档完整且易懂
- ✅ 响应时间满足性能目标
- ✅ 社区反馈积极

## 11. 风险和挑战

### 11.1 技术风险
- **风险**: 不同模型的最佳实践可能变化
- **缓解**: 设计灵活的适配器系统，易于更新

### 11.2 用户体验风险
- **风险**: 用户可能不清楚何时使用哪种格式
- **缓解**: 提供详细文档和智能推荐

### 11.3 性能风险
- **风险**: 大型prompt处理可能较慢
- **缓解**: 实现分块处理和缓存机制

## 12. 下一步

1. ✅ 审查和确认设计文档
2. ⏳ 初始化项目结构
3. ⏳ 实现核心formatter
4. ⏳ 实现适配器
5. ⏳ 集成MCP SDK
6. ⏳ 测试和调试
7. ⏳ 编写文档
8. ⏳ 发布v1.0.0

---

**文档版本**: 1.0
**最后更新**: 2025-11-05
**状态**: 待审核
