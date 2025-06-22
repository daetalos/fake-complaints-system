type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (this.isDevelopment) {
        console[level](message, context);
    }
    // Sentry integration would go here
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    console.error(message, context, error);
     // Sentry integration would go here
  }

  logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, {
      event_type: 'user_action',
      action,
      ...context,
    });
  }

  logPerformance(operation: string, duration: number, context?: Record<string, any>) {
    this.info(`Performance: ${operation}`, {
      event_type: 'performance',
      operation,
      duration_ms: duration,
      ...context,
    });
  }
}

export const logger = new Logger(); 