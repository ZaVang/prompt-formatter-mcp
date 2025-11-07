/**
 * Simple logger for MCP server
 * IMPORTANT: All logs must go to stderr, not stdout
 * MCP uses stdout for JSON-RPC communication
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

  setLevel(level: LogLevel) {
    this.level = level;
  }

  error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      // Always use stderr for MCP compatibility
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      // Use stderr, not stdout
      console.error(`[WARN] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      // Use stderr, not stdout (critical for MCP!)
      console.error(`[INFO] ${message}`, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      // Use stderr, not stdout
      console.error(`[DEBUG] ${message}`, ...args);
    }
  }
}

// Export singleton instance
// Default to ERROR level to avoid polluting stdout
// Set LOG_LEVEL=2 for INFO, LOG_LEVEL=3 for DEBUG
export const logger = new Logger(
  process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL) : LogLevel.ERROR // Changed from INFO to ERROR
);
