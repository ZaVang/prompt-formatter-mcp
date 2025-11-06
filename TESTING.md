# Testing Guide

## Quick Test Methods

有多种方式可以测试和验证MCP服务器是否正常工作。

## 方法1：直接测试核心功能（最简单）⭐

直接运行核心代码，不需要启动MCP服务器：

```bash
npm run test:manual
```

这个脚本会：
- ✅ 测试内容分析器（检测sections）
- ✅ 测试模板格式化（Claude XML 和 GPT Markdown）
- ✅ 测试质量评估（打分）
- ✅ 测试规范验证
- 显示详细的输出结果

**输出示例：**
```
================================================================================
Prompt Formatter MCP - Manual Test
================================================================================

📝 Test Prompt:
--------------------------------------------------------------------------------
You are a professional translator...
--------------------------------------------------------------------------------

🔍 TEST 1: Analyzing Prompt...
✅ Detected Sections:
  - Introduction: ✓
  - Rules: 3 rules
  - Examples: 1 examples
  - Output Format: ✓
  - Task: ✓

📊 Quality Metrics:
  - Clarity Score: 75.0%
  - Completeness Score: 90.0%
  - Structure Score: 80.0%
  - Overall Score: 82.0%

🔧 TEST 2: Formatting to Claude XML...
✅ Formatted Prompt (Claude XML):
<introduction>
You are a professional translator...
</introduction>
<rules>
  <rule>Preserve all formatting tags</rule>
  ...
```

## 方法2：测试MCP工具层（推荐）⭐

测试三个MCP工具的功能：

```bash
npm run test:tools
```

这个脚本会测试：
- ✅ `format_prompt` - 格式化工具
- ✅ `analyze_prompt` - 分析工具
- ✅ `validate_prompt` - 验证工具
- 返回JSON格式的结果（和MCP调用时一样）

**输出示例：**
```
🧪 Testing MCP Tools Directly

1️⃣  Testing format_prompt tool...

✅ Format Result:
{
  "formattedPrompt": "<introduction>...",
  "detectedSections": {
    "introduction": false,
    "rules": 0,
    "examples": 0,
    "outputFormat": false,
    "task": true
  },
  "confidenceScore": 0.2,
  "warnings": [
    "No introduction/role definition detected",
    "No rules detected - consider adding guidelines"
  ],
  "metadata": {
    "originalLength": 64,
    "formattedLength": 82,
    "sectionsDetected": 1
  }
}
```

## 方法3：测试完整的MCP服务器

测试真实的MCP客户端-服务器通信：

```bash
npm run test:mcp
```

这个脚本会：
- 启动MCP服务器进程
- 创建MCP客户端连接
- 列出所有可用工具
- 调用每个工具进行测试
- 验证返回结果

## 方法4：使用MCP Inspector（官方调试工具）

安装MCP Inspector：

```bash
npm install -g @modelcontextprotocol/inspector
```

运行Inspector：

```bash
mcp-inspector node dist/index.js
```

这会打开一个Web界面（通常是 http://localhost:5173），你可以：
- 查看所有可用的工具
- 手动输入参数
- 实时测试工具调用
- 查看完整的请求/响应JSON

## 方法5：与Claude Desktop集成测试

1. **配置Claude Desktop**

编辑配置文件：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

添加：
```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/绝对路径/prompt-formatter-mcp/dist/index.js"]
    }
  }
}
```

2. **重启Claude Desktop**

3. **测试调用**

在Claude Desktop中说：
```
请使用 format_prompt 工具格式化这个prompt：
"You are a translator. Rules: Keep format. Task: Translate."
```

## 方法6：编写单元测试

创建测试文件 `tests/analyzer/content-analyzer.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { ContentAnalyzer } from '../../src/analyzer/content-analyzer.js';

describe('ContentAnalyzer', () => {
  it('should detect introduction section', () => {
    const analyzer = new ContentAnalyzer();
    const result = analyzer.analyze('You are a professional translator.');

    expect(result.sections.introduction).toBeTruthy();
    expect(result.sections.introduction).toContain('translator');
  });

  it('should detect rules', () => {
    const analyzer = new ContentAnalyzer();
    const result = analyzer.analyze('Rule: Keep formatting\nRule: Use natural language');

    expect(result.sections.rules.length).toBe(2);
  });
});
```

运行单元测试：
```bash
npm test
```

## 快速验证脚本

创建一个简单的验证脚本：

```bash
# 快速测试所有功能
npm run test:all
```

## 常见问题

### Q: 如何查看详细的日志？

设置日志级别：
```bash
LOG_LEVEL=3 npm run test:manual
```

级别：
- 0 = ERROR
- 1 = WARN
- 2 = INFO (默认)
- 3 = DEBUG

### Q: 测试失败怎么办？

1. 确保已经构建：
```bash
npm run build
```

2. 检查dist目录是否有文件：
```bash
ls -lh dist/
```

3. 查看具体错误信息

### Q: 如何测试自定义模板？

修改 `scripts/test-tools.js`，添加：

```javascript
const customResult = await formatTool.format(
  testPrompt,
  'custom',
  {
    introduction: '=== ROLE ===\n{{content}}\n\n',
    rules_section: '=== RULES ===\n{{rules}}\n',
    rule_item: '• {{content}}\n',
    task_section: '=== TASK ===\n{{content}}\n'
  }
);
```

## 测试检查清单

在合并到main之前，确保：

- [ ] `npm run build` 成功
- [ ] `npm run test:manual` 通过
- [ ] `npm run test:tools` 通过
- [ ] `npm run lint` 无错误
- [ ] `npm run typecheck` 通过

## 性能基准

预期性能（在标准笔记本上）：

- 格式化操作: 10-50ms
- 分析操作: 20-100ms
- 验证操作: 5-30ms

测试性能：
```bash
time npm run test:tools
```

## 下一步

- 编写更多单元测试覆盖边缘情况
- 添加集成测试
- 性能测试和优化
- 添加更多测试用例到 `examples/`

---

**推荐测试顺序**：
1. 先运行 `npm run test:manual` 看核心功能
2. 再运行 `npm run test:tools` 看工具输出
3. 最后用 MCP Inspector 或 Claude Desktop 测试真实场景
