# TypeScript MCP Server 快速搭建指南

## 🚀 5分钟搭建一个标准MCP Server

### 步骤1: 项目初始化

```bash
# 创建项目目录
mkdir my-mcp-server
cd my-mcp-server

# 初始化npm项目
npm init -y

# 安装依赖
npm install @modelcontextprotocol/sdk
npm install -D typescript @types/node tsup
```

### 步骤2: 配置TypeScript

创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "lib": ["ES2022"],
    "moduleResolution": "Node16",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

创建 `tsup.config.ts`：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node18',
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

### 步骤3: 创建项目结构

```bash
mkdir -p src/{tools,resources,prompts,utils}
touch src/index.ts
touch src/server.ts
touch src/tools/index.ts
touch src/resources/index.ts
touch src/prompts/index.ts
touch src/utils/logger.ts
```

### 步骤4: 基础Server模板

创建 `src/server.ts`：

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * 标准MCP Server模板
 */
export class MyMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'my-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * 设置请求处理器
   */
  private setupHandlers() {
    // 列出工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // 调用工具
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'example_tool':
          return this.handleExampleTool(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * 获取工具列表
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'example_tool',
        description: 'An example tool that echoes input',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message to echo',
            },
          },
          required: ['message'],
        },
      },
    ];
  }

  /**
   * 处理示例工具
   */
  private async handleExampleTool(args: any) {
    const message = args.message || '';

    return {
      content: [
        {
          type: 'text',
          text: `Echo: ${message}`,
        },
      ],
    };
  }

  /**
   * 启动server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[INFO] MCP Server started'); // 注意：使用console.error输出到stderr
  }
}
```

创建 `src/index.ts`：

```typescript
#!/usr/bin/env node

import { MyMCPServer } from './server.js';

/**
 * 主入口点
 */
async function main() {
  const server = new MyMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
```

### 步骤5: 添加Logger

创建 `src/utils/logger.ts`：

```typescript
/**
 * MCP兼容的Logger
 * 重要: 所有日志必须输出到stderr
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = LogLevel.ERROR) {
    this.level = level;
  }

  error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.error(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.error(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }
}

// 导出单例
export const logger = new Logger(
  process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.ERROR
);
```

### 步骤6: 更新package.json

```json
{
  "name": "my-mcp-server",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "my-mcp-server": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 步骤7: 构建和测试

```bash
# 构建
npm run build

# 运行
npm start
```

### 步骤8: 配置Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["/绝对路径/my-mcp-server/dist/index.js"]
    }
  }
}
```

---

## 📦 完整的项目模板（带Tools/Resources/Prompts）

### 进阶：添加Tool

创建 `src/tools/calculator.ts`：

```typescript
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const calculatorTool: Tool = {
  name: 'calculate',
  description: 'Perform basic arithmetic operations',
  inputSchema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The operation to perform',
      },
      a: {
        type: 'number',
        description: 'First number',
      },
      b: {
        type: 'number',
        description: 'Second number',
      },
    },
    required: ['operation', 'a', 'b'],
  },
};

export async function handleCalculate(args: any) {
  const { operation, a, b } = args;

  let result: number;

  switch (operation) {
    case 'add':
      result = a + b;
      break;
    case 'subtract':
      result = a - b;
      break;
    case 'multiply':
      result = a * b;
      break;
    case 'divide':
      if (b === 0) {
        return {
          content: [{ type: 'text', text: 'Error: Division by zero' }],
          isError: true,
        };
      }
      result = a / b;
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return {
    content: [
      {
        type: 'text',
        text: `Result: ${a} ${operation} ${b} = ${result}`,
      },
    ],
  };
}
```

更新 `src/tools/index.ts`：

```typescript
export * from './calculator.js';
```

### 进阶：添加Resource

创建 `src/resources/file-resource.ts`：

```typescript
import { readFile } from 'fs/promises';
import { Resource } from '@modelcontextprotocol/sdk/types.js';

export function getFileResource(filePath: string): Resource {
  return {
    uri: `file://${filePath}`,
    name: `File: ${filePath.split('/').pop()}`,
    description: `Contents of ${filePath}`,
    mimeType: 'text/plain',
  };
}

export async function readFileResource(uri: string) {
  const filePath = uri.replace('file://', '');

  try {
    const content = await readFile(filePath, 'utf-8');

    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
}
```

### 完整的server.ts（整合所有功能）

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { calculatorTool, handleCalculate } from './tools/calculator.js';
import { getFileResource, readFileResource } from './resources/file-resource.js';
import { logger } from './utils/logger.js';

export class MyMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'my-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing tools');
      return {
        tools: [calculatorTool],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Calling tool: ${name}`);

      if (name === 'calculate') {
        return await handleCalculate(args);
      }

      throw new Error(`Unknown tool: ${name}`);
    });

    // Resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.info('Listing resources');
      return {
        resources: [
          getFileResource('/path/to/example.txt'),
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      logger.info(`Reading resource: ${uri}`);

      if (uri.startsWith('file://')) {
        return await readFileResource(uri);
      }

      throw new Error(`Unknown resource URI: ${uri}`);
    });

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      logger.info('Listing prompts');
      return {
        prompts: [
          {
            name: 'code_review',
            description: 'Review code for bugs and improvements',
            arguments: [
              {
                name: 'code',
                description: 'The code to review',
                required: true,
              },
            ],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Getting prompt: ${name}`);

      if (name === 'code_review') {
        const code = args?.code || '';
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Please review the following code:\n\n${code}\n\nProvide feedback on:\n1. Bugs\n2. Performance\n3. Best practices`,
              },
            },
          ],
        };
      }

      throw new Error(`Unknown prompt: ${name}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('MCP Server started');
  }
}
```

---

## 🧪 测试（使用Vitest）

安装测试依赖：

```bash
npm install -D vitest
```

创建 `tests/tools.test.ts`：

```typescript
import { describe, it, expect } from 'vitest';
import { handleCalculate } from '../src/tools/calculator.js';

describe('Calculator Tool', () => {
  it('should add two numbers', async () => {
    const result = await handleCalculate({
      operation: 'add',
      a: 2,
      b: 3,
    });

    expect(result.content[0].text).toContain('5');
  });

  it('should handle division by zero', async () => {
    const result = await handleCalculate({
      operation: 'divide',
      a: 10,
      b: 0,
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Division by zero');
  });
});
```

添加测试脚本到 `package.json`：

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

运行测试：

```bash
npm test
```

---

## 📝 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await doSomething();
  return { content: [{ type: 'text', text: result }] };
} catch (error) {
  logger.error('Error:', error);
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
    ],
    isError: true,
  };
}
```

### 2. 类型安全

```typescript
// 定义工具参数类型
interface CalculateArgs {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  a: number;
  b: number;
}

export async function handleCalculate(args: CalculateArgs) {
  // TypeScript会检查类型
}
```

### 3. 模块化

```typescript
// 将工具组织成模块
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export class ToolsModule {
  getTools(): Tool[] {
    return [
      this.calculatorTool,
      this.weatherTool,
      // ...
    ];
  }

  private get calculatorTool(): Tool {
    return { /* ... */ };
  }
}
```

---

## 🎓 进阶主题

- **SSE Transport**: 远程服务器部署
- **WebSocket Transport**: 实时通信
- **认证授权**: 添加安全层
- **缓存策略**: 提高性能
- **Docker部署**: 容器化

查看官方文档：
- https://github.com/modelcontextprotocol/typescript-sdk
- https://modelcontextprotocol.io/

---

**恭喜！🎉** 你已经创建了一个标准的TypeScript MCP Server！
