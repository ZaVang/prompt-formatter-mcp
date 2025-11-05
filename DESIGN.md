# Prompt Formatter MCP Server - 设计文档

## 1. 项目概述

### 1.1 项目目标
创建一个MCP（Model Context Protocol）服务，用于智能格式化和优化用户的prompt，使其更符合不同LLM模型的偏好，从而提高模型的指令遵循能力和输出质量。

### 1.2 核心理念
- **单一职责**：专注于prompt格式化和优化
- **模块化设计**：避免代码耦合，便于维护和扩展
- **模型适配**：针对不同模型的特性进行优化
- **用户友好**：提供简单易用的API接口

## 2. 核心功能

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

### 2.2 智能优化器 (Optimizer)
- **结构分析**: 自动识别prompt中的关键组成部分
  - 指令 (Instructions)
  - 上下文 (Context)
  - 示例 (Examples)
  - 约束条件 (Constraints)
  - 输出要求 (Output Format)

- **内容重组**: 按照最佳实践重新组织内容
- **冗余消除**: 去除重复或不必要的内容
- **清晰度增强**: 使指令更加明确和具体

### 2.3 模型适配器 (Model Adapter)
- **Claude适配**:
  - XML格式化
  - 强调示例和思维链
  - 使用`<thinking>`标签支持推理过程

- **GPT适配**:
  - Markdown格式化
  - 优化system prompt和user prompt的分离
  - 支持few-shot examples

- **通用适配**:
  - 提供baseline格式化
  - 适用于其他模型

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
│   │   ├── prompt.ts
│   │   └── format.ts
│   ├── formatters/              # 格式化器模块
│   │   ├── index.ts
│   │   ├── base.ts              # 基础格式化器抽象类
│   │   ├── markdown.ts          # Markdown格式化器
│   │   ├── xml.ts               # XML格式化器
│   │   ├── json.ts              # JSON格式化器
│   │   └── yaml.ts              # YAML格式化器
│   ├── optimizers/              # 优化器模块
│   │   ├── index.ts
│   │   ├── analyzer.ts          # 内容分析器
│   │   ├── restructurer.ts      # 结构重组器
│   │   └── enhancer.ts          # 内容增强器
│   ├── adapters/                # 模型适配器
│   │   ├── index.ts
│   │   ├── base.ts              # 基础适配器
│   │   ├── claude.ts            # Claude适配器
│   │   ├── gpt.ts               # GPT适配器
│   │   └── generic.ts           # 通用适配器
│   ├── tools/                   # MCP工具定义
│   │   ├── index.ts
│   │   ├── format.ts            # format工具
│   │   ├── optimize.ts          # optimize工具
│   │   └── adapt.ts             # adapt工具
│   ├── resources/               # MCP资源（未来扩展）
│   │   └── index.ts
│   ├── prompts/                 # MCP提示（模板，未来扩展）
│   │   └── index.ts
│   └── utils/                   # 工具函数
│       ├── logger.ts
│       ├── validator.ts
│       └── parser.ts
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

#### BaseFormatter (抽象基类)
```typescript
abstract class BaseFormatter {
  abstract format(prompt: PromptInput): Promise<FormattedPrompt>;
  protected abstract validate(prompt: PromptInput): boolean;
  protected parsePrompt(raw: string): ParsedPrompt;
}
```

#### BaseAdapter (适配器基类)
```typescript
abstract class BaseAdapter {
  protected formatter: BaseFormatter;
  abstract adapt(prompt: PromptInput): Promise<AdaptedPrompt>;
  protected getOptimalFormat(): FormatType;
}
```

#### Optimizer (优化器)
```typescript
class PromptOptimizer {
  analyze(prompt: string): PromptStructure;
  restructure(structure: PromptStructure): RestructuredPrompt;
  enhance(prompt: RestructuredPrompt): EnhancedPrompt;
}
```

## 6. MCP API 设计

### 6.1 Tools（工具）

#### Tool 1: format
格式化prompt到指定格式
```typescript
{
  name: "format",
  description: "Format a prompt into a specific structure (markdown, xml, json, yaml)",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The raw prompt text" },
      format: {
        type: "string",
        enum: ["markdown", "xml", "json", "yaml"],
        description: "Target format"
      },
      options: {
        type: "object",
        properties: {
          includeMetadata: { type: "boolean" },
          preserveWhitespace: { type: "boolean" }
        }
      }
    },
    required: ["prompt", "format"]
  }
}
```

#### Tool 2: optimize
优化prompt结构和内容
```typescript
{
  name: "optimize",
  description: "Analyze and optimize prompt structure for better clarity",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The prompt to optimize" },
      level: {
        type: "string",
        enum: ["basic", "standard", "advanced"],
        description: "Optimization level"
      }
    },
    required: ["prompt"]
  }
}
```

#### Tool 3: adapt
针对特定模型适配prompt
```typescript
{
  name: "adapt",
  description: "Adapt a prompt for a specific LLM model",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "The prompt to adapt" },
      targetModel: {
        type: "string",
        enum: ["claude", "gpt", "generic"],
        description: "Target LLM model"
      },
      optimizationLevel: {
        type: "string",
        enum: ["basic", "standard", "advanced"],
        default: "standard"
      }
    },
    required: ["prompt", "targetModel"]
  }
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
**目标**: 实现基本的格式化和适配功能

1. **项目初始化**
   - 设置TypeScript + Node.js环境
   - 配置MCP SDK
   - 建立项目结构

2. **实现核心模块**
   - BaseFormatter抽象类
   - MarkdownFormatter
   - XMLFormatter
   - 基本的PromptOptimizer

3. **实现适配器**
   - ClaudeAdapter
   - GPTAdapter
   - GenericAdapter

4. **MCP工具实现**
   - format工具
   - adapt工具

5. **测试和文档**
   - 单元测试
   - 集成测试
   - API文档
   - 使用示例

### Phase 2: 扩展功能
- JSON/YAML格式化器
- optimize工具
- 模板库（Resources）
- Prompt验证器

### Phase 3: 高级功能
- 学习和反馈系统
- 批量处理
- 性能分析

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
