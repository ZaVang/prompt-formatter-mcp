import { PromptFormatterServer } from './server.js';
import { logger } from './utils/logger.js';

// Export all modules for testing and programmatic use
export * from './types/index.js';
export * from './analyzer/index.js';
export * from './templates/index.js';
export * from './validators/index.js';
export * from './tools/index.js';
export { PromptFormatterServer } from './server.js';

/**
 * Main entry point
 */
async function main() {
  try {
    const server = new PromptFormatterServer();
    await server.start();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only run server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
