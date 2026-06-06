const isProduction = __DEV__ === false;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = isProduction ? 'warn' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function prefix(level: LogLevel, tag?: string): string {
  const timestamp = new Date().toISOString().split('T')[1]?.split('.')[0] || '';
  const tagStr = tag ? `[${tag}]` : '';
  return `${timestamp} ${level.toUpperCase()} ${tagStr}`;
}

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(`${prefix('debug')} ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(`${prefix('info')} ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(`${prefix('warn')} ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(`${prefix('error')} ${message}`, ...args);
    }
  },
};
