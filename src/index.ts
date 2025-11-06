#!/usr/bin/env node

import { PromptFormatterServer } from './server.js';
import { logger } from './utils/logger.js';

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

main();
