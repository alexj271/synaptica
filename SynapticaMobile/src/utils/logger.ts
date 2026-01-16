const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  debug(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.debug) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.info) {
      console.log('[INFO]', ...args);
    }
  }

  warn(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.warn) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: any[]) {
    if (LOG_LEVELS[this.level] <= LOG_LEVELS.error) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();
