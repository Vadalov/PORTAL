import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error | unknown, context?: LogContext): void;
  fatal(message: string, error?: Error | unknown, context?: LogContext): void;
}

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = !isDevelopment;

const logLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const minLogLevel = isDevelopment ? 'debug' : 'warn';
const minPriority = logLevelPriority[minLogLevel];

const colors: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};
const resetColor = '\x1b[0m';

function maskSensitive(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key in masked) {
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('token') || key.toLowerCase().includes('apikey')) {
      masked[key] = '***MASKED***';
    } else {
      masked[key] = maskSensitive(masked[key]);
    }
  }
  return masked;
}

function shortenStackTrace(error: Error): Error {
  if (isProduction && error.stack) {
    const lines = error.stack.split('\n');
    error.stack = `${lines.slice(0, 5).join('\n')  }\n... (truncated)`;
  }
  return error;
}

class LoggerImpl implements Logger {
  private namespace?: string;
  private baseContext?: LogContext;

  constructor(namespace?: string, baseContext?: LogContext) {
    this.namespace = namespace;
    this.baseContext = baseContext;
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevelPriority[level] >= minPriority;
  }

  private log(level: LogLevel, message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const fullContext = { ...this.baseContext, ...context };
    if (this.namespace) fullContext.namespace = this.namespace;

    const safeContext = maskSensitive(fullContext);
    let safeError: Error | unknown = error;
    if (error instanceof Error) {
      safeError = shortenStackTrace(new Error(error.message));
      (safeError as Error).stack = (error as Error).stack;
    }

    const logEntry = {
      timestamp,
      level,
      message,
      context: safeContext,
      ...(safeError ? { error: safeError } : {}),
    };

    if (isDevelopment) {
      const color = colors[level];
      console.log(`${color}${level.toUpperCase()}${resetColor} ${timestamp} ${message}`);
      if (Object.keys(safeContext).length > 0) {
        console.log(JSON.stringify(safeContext, null, 2));
      }
      if (safeError) {
        console.error(safeError);
      }
    } else {
      console.log(JSON.stringify(logEntry));
    }

    if ((level === 'error' || level === 'fatal') && process.env.SENTRY_DSN) {
      Sentry.captureException(safeError || new Error(message), {
        tags: { level, ...safeContext },
        extra: safeContext,
      });
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    this.log('error', message, error, context);
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    this.log('fatal', message, error, context);
  }
}

const logger = new LoggerImpl();

export function createLogger(namespace: string): Logger {
  return new LoggerImpl(namespace);
}

export function withContext(context: LogContext): Logger {
  return new LoggerImpl(undefined, context);
}

export function measureTime<T>(fn: () => T, label?: string): T {
  const start = Date.now();
  try {
    const result = fn();
    logger.info('Function executed', { duration: Date.now() - start, label });
    return result;
  } catch (error) {
    logger.error('Function failed', error, { duration: Date.now() - start, label });
    throw error;
  }
}

export type { LogLevel, LogContext };

export default logger;