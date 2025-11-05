import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { FormatPromptTool } from './tools/format-prompt.js';
import { AnalyzePromptTool } from './tools/analyze-prompt.js';
import { ValidatePromptTool } from './tools/validate-prompt.js';
import { logger } from './utils/logger.js';

/**
 * Prompt Formatter MCP Server
 */
export class PromptFormatterServer {
  private server: Server;
  private formatTool: FormatPromptTool;
  private analyzeTool: AnalyzePromptTool;
  private validateTool: ValidatePromptTool;

  constructor() {
    this.server = new Server(
      {
        name: 'prompt-formatter-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.formatTool = new FormatPromptTool();
    this.analyzeTool = new AnalyzePromptTool();
    this.validateTool = new ValidatePromptTool();

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'format_prompt':
            return await this.handleFormatPrompt(args);

          case 'analyze_prompt':
            return await this.handleAnalyzePrompt(args);

          case 'validate_prompt':
            return await this.handleValidatePrompt(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Error handling tool ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Get tool definitions
   */
  private getToolDefinitions(): Tool[] {
    return [
      {
        name: 'format_prompt',
        description:
          'Format a raw prompt into a structured format (XML for Claude, Markdown for GPT, or custom template)',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The raw prompt text to format',
            },
            targetFormat: {
              type: 'string',
              enum: ['claude_xml', 'gpt_markdown', 'json', 'custom'],
              description: 'Target format template',
              default: 'claude_xml',
            },
            customTemplate: {
              type: 'object',
              description:
                "Custom template definition (only when targetFormat is 'custom')",
              properties: {
                introduction: { type: 'string' },
                rules_section: { type: 'string' },
                rule_item: { type: 'string' },
                examples_section: { type: 'string' },
                output_section: { type: 'string' },
                task_section: { type: 'string' },
              },
            },
            options: {
              type: 'object',
              properties: {
                preserveWhitespace: {
                  type: 'boolean',
                  default: false,
                  description: 'Preserve original whitespace',
                },
                strictMode: {
                  type: 'boolean',
                  default: false,
                  description: 'Fail if cannot detect required sections',
                },
                includeMetadata: {
                  type: 'boolean',
                  default: false,
                  description: 'Include metadata in response',
                },
              },
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'analyze_prompt',
        description:
          'Analyze prompt structure and quality, return suggestions for Agent to optimize',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to analyze',
            },
            targetModel: {
              type: 'string',
              enum: ['claude', 'gpt', 'generic'],
              description: 'Target LLM model for optimization suggestions',
              default: 'generic',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'validate_prompt',
        description:
          'Validate if a prompt follows the recommended conventions (see CONVENTIONS.md)',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt to validate',
            },
          },
          required: ['prompt'],
        },
      },
    ];
  }

  /**
   * Handle format_prompt tool call
   */
  private async handleFormatPrompt(args: any) {
    const {
      prompt,
      targetFormat = 'claude_xml',
      customTemplate,
      options = {},
    } = args;

    const result = await this.formatTool.format(
      prompt,
      targetFormat,
      customTemplate,
      options
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle analyze_prompt tool call
   */
  private async handleAnalyzePrompt(args: any) {
    const { prompt, targetModel } = args;

    const result = await this.analyzeTool.analyze(prompt, targetModel);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle validate_prompt tool call
   */
  private async handleValidatePrompt(args: any) {
    const { prompt } = args;

    const result = await this.validateTool.validate(prompt);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Prompt Formatter MCP Server started');
  }
}
