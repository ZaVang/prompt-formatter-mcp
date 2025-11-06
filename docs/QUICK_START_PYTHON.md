# Python MCP Server 快速搭建指南

## 🚀 5分钟搭建一个标准MCP Server

### 步骤1: 项目初始化

```bash
# 创建项目目录
mkdir my-mcp-server
cd my-mcp-server

# 创建Python环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装MCP SDK
pip install mcp
```

### 步骤2: 创建项目结构

```bash
mkdir -p src/{tools,resources,prompts,utils}
touch src/__init__.py
touch src/server.py
touch src/tools/__init__.py
touch src/resources/__init__.py
touch src/prompts/__init__.py
touch src/utils/__init__.py
touch src/utils/logger.py
```

### 步骤3: 基础Server模板

创建 `src/server.py`：

```python
"""
标准MCP Server模板
"""
import asyncio
import sys
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)

# 创建server实例
app = Server("my-mcp-server")

# ============================================================================
# Tools - 工具定义
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """列出所有可用工具"""
    return [
        Tool(
            name="example_tool",
            description="An example tool that echoes input",
            inputSchema={
                "type": "object",
                "properties": {
                    "message": {
                        "type": "string",
                        "description": "Message to echo"
                    }
                },
                "required": ["message"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> CallToolResult:
    """处理工具调用"""
    if name == "example_tool":
        message = arguments.get("message", "")
        return CallToolResult(
            content=[
                TextContent(
                    type="text",
                    text=f"Echo: {message}"
                )
            ]
        )

    raise ValueError(f"Unknown tool: {name}")

# ============================================================================
# Resources - 资源定义（可选）
# ============================================================================

@app.list_resources()
async def list_resources() -> list:
    """列出所有可用资源"""
    return []

# ============================================================================
# Prompts - 提示模板（可选）
# ============================================================================

@app.list_prompts()
async def list_prompts() -> list:
    """列出所有可用提示模板"""
    return []

# ============================================================================
# Main入口
# ============================================================================

async def main():
    """启动MCP Server"""
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

### 步骤4: 添加Logger

创建 `src/utils/logger.py`：

```python
"""
MCP Server日志工具
重要: 所有日志必须输出到stderr，不能污染stdout
"""
import sys
import logging
from typing import Optional

class MCPLogger:
    """MCP兼容的Logger"""

    def __init__(self, name: str, level: int = logging.ERROR):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)

        # 创建stderr handler
        handler = logging.StreamHandler(sys.stderr)
        handler.setLevel(level)

        # 格式化
        formatter = logging.Formatter(
            '[%(levelname)s] %(name)s: %(message)s'
        )
        handler.setFormatter(formatter)

        self.logger.addHandler(handler)

    def debug(self, msg: str, *args, **kwargs):
        self.logger.debug(msg, *args, **kwargs)

    def info(self, msg: str, *args, **kwargs):
        self.logger.info(msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs):
        self.logger.warning(msg, *args, **kwargs)

    def error(self, msg: str, *args, **kwargs):
        self.logger.error(msg, *args, **kwargs)

# 创建全局logger实例
logger = MCPLogger("mcp-server")
```

### 步骤5: 创建配置文件

创建 `pyproject.toml`：

```toml
[project]
name = "my-mcp-server"
version = "0.1.0"
description = "My MCP Server"
requires-python = ">=3.10"
dependencies = [
    "mcp>=0.9.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_backend"
```

创建 `requirements.txt`：

```
mcp>=0.9.0
```

### 步骤6: 测试Server

```bash
# 安装依赖
pip install -r requirements.txt

# 运行server
python src/server.py
```

### 步骤7: 配置Claude Desktop

编辑 `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "python",
      "args": ["/绝对路径/my-mcp-server/src/server.py"],
      "env": {
        "PYTHONPATH": "/绝对路径/my-mcp-server"
      }
    }
  }
}
```

---

## 📦 完整的项目模板（带Tools/Resources/Prompts）

### 进阶：添加Tool

创建 `src/tools/calculator.py`：

```python
"""计算器工具示例"""
from mcp.types import Tool, TextContent, CallToolResult

def get_calculator_tool() -> Tool:
    """获取计算器工具定义"""
    return Tool(
        name="calculate",
        description="Perform basic arithmetic operations",
        inputSchema={
            "type": "object",
            "properties": {
                "operation": {
                    "type": "string",
                    "enum": ["add", "subtract", "multiply", "divide"],
                    "description": "The operation to perform"
                },
                "a": {
                    "type": "number",
                    "description": "First number"
                },
                "b": {
                    "type": "number",
                    "description": "Second number"
                }
            },
            "required": ["operation", "a", "b"]
        }
    )

async def handle_calculate(arguments: dict) -> CallToolResult:
    """处理计算请求"""
    operation = arguments["operation"]
    a = arguments["a"]
    b = arguments["b"]

    if operation == "add":
        result = a + b
    elif operation == "subtract":
        result = a - b
    elif operation == "multiply":
        result = a * b
    elif operation == "divide":
        if b == 0:
            return CallToolResult(
                content=[TextContent(type="text", text="Error: Division by zero")],
                isError=True
            )
        result = a / b
    else:
        raise ValueError(f"Unknown operation: {operation}")

    return CallToolResult(
        content=[
            TextContent(
                type="text",
                text=f"Result: {a} {operation} {b} = {result}"
            )
        ]
    )
```

更新 `src/tools/__init__.py`：

```python
"""工具模块"""
from .calculator import get_calculator_tool, handle_calculate

__all__ = ["get_calculator_tool", "handle_calculate"]
```

### 进阶：添加Resource

创建 `src/resources/file_resource.py`：

```python
"""文件资源示例"""
from mcp.types import Resource, TextContent, ReadResourceResult
from pathlib import Path

def get_file_resource(file_path: str) -> Resource:
    """获取文件资源定义"""
    return Resource(
        uri=f"file://{file_path}",
        name=f"File: {Path(file_path).name}",
        description=f"Contents of {file_path}",
        mimeType="text/plain"
    )

async def read_file_resource(uri: str) -> ReadResourceResult:
    """读取文件资源"""
    # 从URI中提取文件路径
    file_path = uri.replace("file://", "")

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return ReadResourceResult(
            contents=[
                TextContent(
                    type="text",
                    text=content,
                    uri=uri
                )
            ]
        )
    except FileNotFoundError:
        return ReadResourceResult(
            contents=[
                TextContent(
                    type="text",
                    text=f"Error: File not found: {file_path}"
                )
            ]
        )
```

### 完整的server.py（整合所有功能）

```python
"""
完整的MCP Server示例
包含: Tools, Resources, Prompts
"""
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    Resource,
    Prompt,
    TextContent,
    CallToolResult,
    GetPromptResult,
    PromptMessage,
    PromptArgument,
)

# 导入自定义工具
from tools import get_calculator_tool, handle_calculate
from resources.file_resource import get_file_resource, read_file_resource
from utils.logger import logger

# 创建server
app = Server("my-mcp-server")

# ============================================================================
# Tools
# ============================================================================

@app.list_tools()
async def list_tools() -> list[Tool]:
    """列出所有工具"""
    logger.info("Listing tools")
    return [
        get_calculator_tool(),
        # 添加更多工具...
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> CallToolResult:
    """调用工具"""
    logger.info(f"Calling tool: {name}")

    if name == "calculate":
        return await handle_calculate(arguments)

    raise ValueError(f"Unknown tool: {name}")

# ============================================================================
# Resources
# ============================================================================

@app.list_resources()
async def list_resources() -> list[Resource]:
    """列出所有资源"""
    logger.info("Listing resources")
    return [
        get_file_resource("/path/to/example.txt"),
        # 添加更多资源...
    ]

@app.read_resource()
async def read_resource(uri: str) -> ReadResourceResult:
    """读取资源"""
    logger.info(f"Reading resource: {uri}")

    if uri.startswith("file://"):
        return await read_file_resource(uri)

    raise ValueError(f"Unknown resource URI: {uri}")

# ============================================================================
# Prompts
# ============================================================================

@app.list_prompts()
async def list_prompts() -> list[Prompt]:
    """列出所有提示模板"""
    logger.info("Listing prompts")
    return [
        Prompt(
            name="code_review",
            description="Review code for bugs and improvements",
            arguments=[
                PromptArgument(
                    name="code",
                    description="The code to review",
                    required=True
                )
            ]
        )
    ]

@app.get_prompt()
async def get_prompt(name: str, arguments: dict) -> GetPromptResult:
    """获取提示模板"""
    logger.info(f"Getting prompt: {name}")

    if name == "code_review":
        code = arguments.get("code", "")
        return GetPromptResult(
            messages=[
                PromptMessage(
                    role="user",
                    content=TextContent(
                        type="text",
                        text=f"Please review the following code:\n\n{code}\n\nProvide feedback on:\n1. Bugs\n2. Performance\n3. Best practices"
                    )
                )
            ]
        )

    raise ValueError(f"Unknown prompt: {name}")

# ============================================================================
# Main
# ============================================================================

async def main():
    """启动server"""
    logger.info("Starting MCP server")
    async with stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
```

---

## 🧪 测试

创建 `tests/test_tools.py`：

```python
"""测试工具"""
import pytest
from src.tools.calculator import handle_calculate

@pytest.mark.asyncio
async def test_calculator_add():
    """测试加法"""
    result = await handle_calculate({
        "operation": "add",
        "a": 2,
        "b": 3
    })

    assert "5" in result.content[0].text

@pytest.mark.asyncio
async def test_calculator_divide_by_zero():
    """测试除以零"""
    result = await handle_calculate({
        "operation": "divide",
        "a": 10,
        "b": 0
    })

    assert result.isError
    assert "Division by zero" in result.content[0].text
```

运行测试：

```bash
pip install pytest pytest-asyncio
pytest tests/
```

---

## 📝 最佳实践

1. **错误处理**
   ```python
   try:
       result = do_something()
   except Exception as e:
       logger.error(f"Error: {e}")
       return CallToolResult(
           content=[TextContent(type="text", text=f"Error: {str(e)}")],
           isError=True
       )
   ```

2. **输入验证**
   ```python
   def validate_input(arguments: dict, required_fields: list[str]):
       for field in required_fields:
           if field not in arguments:
               raise ValueError(f"Missing required field: {field}")
   ```

3. **日志记录**
   ```python
   from utils.logger import logger

   logger.info("Operation started")
   logger.error("Operation failed")
   # 所有日志自动输出到stderr
   ```

4. **异步处理**
   ```python
   import asyncio

   async def fetch_data():
       # 使用async/await处理I/O操作
       await asyncio.sleep(1)
       return "data"
   ```

---

## 🎓 进阶主题

- **使用FastMCP**: 更简洁的装饰器语法
- **SSE Transport**: 远程服务器部署
- **认证授权**: 添加安全层
- **性能优化**: 缓存、连接池
- **Docker部署**: 容器化

查看官方文档获取更多信息：
- https://github.com/modelcontextprotocol/python-sdk
- https://modelcontextprotocol.io/

---

**恭喜！🎉** 你已经创建了一个标准的Python MCP Server！
