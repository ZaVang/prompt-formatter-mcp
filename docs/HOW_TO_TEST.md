# 如何测试 Prompt Formatter MCP

## 🚀 快速测试（推荐）

最简单的方法，直接运行核心功能测试：

```bash
npm run test:quick
```

这会测试三个主要工具并显示结果。

## 📋 测试输出示例

```
================================================================================
Prompt Formatter MCP - Simple Test
================================================================================

Test Prompt: You are a translator. Rules: Keep formatting. Task: Translate this text.

1. Testing format_prompt tool...
SUCCESS - Formatted Prompt:
<introduction>
You are a translator. Rules: Keep formatting. Task: Translate this text.
</introduction>

Confidence Score: 0.20
Sections Detected: 1

2. Testing analyze_prompt tool...
SUCCESS - Analysis:
Overall Score: 36.5%
Missing Sections: rules, context, examples, outputFormat, task
Suggestions: Add rules using 'Rule:', 'Must', 'Should', or 'Always' keywords...

3. Testing validate_prompt tool...
SUCCESS - Validation:
Is Valid: true
Compliance Score: 83.3%
Passed Checks: 5 / 6
```

## 🔧 其他测试方法

### 方法1：直接调用工具类

创建你自己的测试脚本：

```javascript
import { FormatPromptTool } from './dist/index.js';

const tool = new FormatPromptTool();
const result = await tool.format(
  "Your prompt here",
  'claude_xml'
);

console.log(result.formattedPrompt);
```

### 方法2：使用MCP Inspector（官方工具）

```bash
# 安装Inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

然后在浏览器中打开显示的URL（通常是 http://localhost:5173）

### 方法3：与Claude Desktop集成

**重要**: 确保使用最新的构建版本（已修复日志bug）

1. 编辑Claude Desktop配置：
```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/绝对路径/to/prompt-formatter-mcp/dist/index.js"]
    }
  }
}
```

**如果需要调试日志**，添加环境变量：
```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/绝对路径/to/prompt-formatter-mcp/dist/index.js"],
      "env": {
        "LOG_LEVEL": "2"
      }
    }
  }
}
```

2. 重启Claude Desktop

3. 在对话中说：
```
请使用 format_prompt 工具格式化这个prompt：
"You are a translator. Task: Translate this."
```

## ✅ 验证MCP服务器运行

检查服务器是否能正常启动：

```bash
node dist/index.js
```

服务器应该启动并等待输入（通过stdio）。按 Ctrl+C 退出。

## 📊 验证结果

成功的测试应该显示：

- ✅ format_prompt: 返回格式化的prompt
- ✅ analyze_prompt: 返回质量分数和建议
- ✅ validate_prompt: 返回验证结果和合规分数

## 🐛 常见问题

### Q: 看到 "Module not found" 错误

**解决方案**：先构建项目
```bash
npm run build
```

### Q: 看到 "Invalid or unexpected token" 错误

**解决方案**：检查dist/index.js是否有多个shebang行，重新构建
```bash
rm -rf dist
npm run build
```

### Q: 如何测试具体的prompt？

修改 `scripts/test-simple.js` 中的 `testPrompt` 变量，或创建你自己的测试文件：

```javascript
import { ContentAnalyzer } from './dist/index.js';

const analyzer = new ContentAnalyzer();
const result = analyzer.analyze("Your prompt here");
console.log(result);
```

## 📖 完整文档

- [TESTING.md](./TESTING.md) - 详细测试指南
- [USAGE.md](./docs/USAGE.md) - 使用说明
- [CONVENTIONS.md](./CONVENTIONS.md) - Prompt编写规范

## 🎯 下一步

测试通过后，你可以：

1. 添加更多测试用例到 `examples/sample-prompts.md`
2. 编写单元测试（使用vitest）
3. 在实际项目中集成使用
4. 提交反馈和改进建议

---

**快速开始**: 
```bash
npm install
npm run build
npm run test:quick
```

搞定！🎉

## 🔍 调试和日志

### 默认行为（生产模式）

默认情况下，服务器**不输出详细日志**，只显示错误。这是为了：
- ✅ 确保MCP通信不被污染
- ✅ 避免性能影响
- ✅ 符合MCP最佳实践

### 启用调试日志

**日志级别**：
- `0` - ERROR：只显示错误（默认）
- `1` - WARN：显示警告
- `2` - INFO：显示信息（推荐调试用）
- `3` - DEBUG：显示所有日志

**本地测试时启用日志**：
```bash
LOG_LEVEL=2 npm run test:quick
```

**Claude Desktop中启用日志**：
在配置中添加`env`：
```json
{
  "mcpServers": {
    "prompt-formatter": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "LOG_LEVEL": "2"
      }
    }
  }
}
```

**查看Claude Desktop日志**：
- macOS: `~/Library/Logs/Claude/`
- Windows: `%APPDATA%\Claude\logs\`

### 重要提示

⚠️ **不要修改logger输出到stdout**！这会破坏MCP通信。

如果遇到 `Unexpected token 'I', "[INFO]..." is not valid JSON` 错误，说明日志污染了JSON消息流。解决方法：
1. 确保使用最新构建版本
2. 检查logger是否输出到stderr（`console.error`）
3. 参考 [LOGGING_FIX.md](./LOGGING_FIX.md)
