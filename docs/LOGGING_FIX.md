# MCP Logging Fix - Critical Bug

## 问题描述

在与Claude Desktop集成时出现错误：
```
Unexpected token 'I', "[INFO] Prom"... is not valid JSON
```

## 根本原因

**MCP协议通过stdio（标准输入/输出）进行JSON-RPC通信：**
- stdout：用于传输JSON-RPC消息
- stdin：用于接收JSON-RPC消息

**我们的logger错误地使用了stdout：**
- `console.log()` 输出到 stdout → ❌ 污染JSON消息流
- `console.error()` 输出到 stderr → ✅ 不影响MCP通信

当logger输出 `[INFO] Formatting prompt...` 到stdout时，它会和JSON-RPC消息混在一起，导致JSON解析失败。

## 修复方案

### 1. 所有日志输出到stderr

修改 `src/utils/logger.ts`：
```typescript
// 之前（错误）
info(message: string, ...args: any[]) {
  console.log(`[INFO] ${message}`, ...args);  // ❌ 输出到stdout
}

// 之后（正确）
info(message: string, ...args: any[]) {
  console.error(`[INFO] ${message}`, ...args);  // ✅ 输出到stderr
}
```

### 2. 默认禁用详细日志

```typescript
// 之前
export const logger = new Logger(LogLevel.INFO);  // ❌ 默认显示INFO

// 之后
export const logger = new Logger(LogLevel.ERROR);  // ✅ 默认只显示ERROR
```

## 日志级别控制

### 生产使用（默认）
```bash
# 不设置环境变量，默认只显示错误
node dist/index.js
```

### 开发调试
```bash
# 启用INFO日志
LOG_LEVEL=2 node dist/index.js

# 启用DEBUG日志
LOG_LEVEL=3 node dist/index.js
```

### 在Claude Desktop中启用调试
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

## 日志级别说明

- `0` - ERROR：只显示错误（默认，推荐用于生产）
- `1` - WARN：显示警告和错误
- `2` - INFO：显示信息、警告和错误（开发调试用）
- `3` - DEBUG：显示所有日志（详细调试用）

## 验证修复

### 测试1：检查stdout是否纯净
```bash
node dist/index.js < /dev/null | head -1
```
应该不输出任何内容或只输出JSON（不应该有[INFO]等日志）

### 测试2：在Claude Desktop中测试
1. 重新构建：`npm run build`
2. 重启Claude Desktop
3. 调用任何工具，应该不再报JSON解析错误

### 测试3：验证日志仍然可用
```bash
# 启用日志并查看stderr
LOG_LEVEL=2 node dist/index.js 2>&1 | grep INFO
```

## 最佳实践

### ✅ 正确的MCP日志方式
- 所有日志使用 `console.error()`（输出到stderr）
- 默认日志级别设为ERROR或完全禁用
- 通过环境变量控制日志级别
- 在文档中明确说明如何启用调试日志

### ❌ 避免的做法
- 使用 `console.log()` 输出日志
- 使用 `process.stdout.write()` 输出非JSON内容
- 默认启用INFO或DEBUG级别
- 在生产环境输出详细日志

## 相关资源

- [MCP Specification - Transport](https://spec.modelcontextprotocol.io/specification/architecture/#transports)
- [stdio Transport](https://spec.modelcontextprotocol.io/specification/architecture/#stdio)

## 修复提交

- Commit: `Fix critical logging bug that breaks MCP stdio communication`
- Files changed:
  - `src/utils/logger.ts` - All logs to stderr, default ERROR level

## 影响

**Before (Broken):**
```
❌ Claude Desktop报错：Unexpected token 'I', "[INFO]..." is not valid JSON
❌ MCP Inspector无法连接
❌ 所有MCP客户端通信失败
```

**After (Fixed):**
```
✅ Claude Desktop正常工作
✅ MCP Inspector可以连接
✅ 所有MCP客户端通信正常
✅ 仍然可以通过LOG_LEVEL启用调试日志
```

---

**重要提示**：这是所有MCP服务器的常见问题。如果你在开发自己的MCP服务器，务必：
1. 永远不要向stdout输出非JSON内容
2. 所有日志、调试信息都应该输出到stderr
3. 默认禁用详细日志
