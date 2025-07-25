// Comprehensive logging system for security and debugging

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SECURITY = 4,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: any
  userId?: string
  ip?: string
  userAgent?: string
}

export class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private addLog(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
    }

    this.logs.push(entry)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    if (import.meta.env.DEV) {
      console.log(`[${LogLevel[level]}] ${message}`, context || '')
    }
  }

  debug(message: string, context?: any) {
    this.addLog(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: any) {
    this.addLog(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: any) {
    this.addLog(LogLevel.WARN, message, context)
  }

  error(message: string, context?: any) {
    this.addLog(LogLevel.ERROR, message, context)
  }

  security(message: string, context?: any) {
    this.addLog(LogLevel.SECURITY, message, context)
  }

  // Security-specific logging
  logLoginAttempt(email: string, success: boolean, ip?: string) {
    this.security('Login attempt', {
      email,
      success,
      ip: ip || this.getClientIP(),
    })
  }

  logFileUpload(fileName: string, fileSize: number, fileType: string, success: boolean) {
    this.security('File upload', {
      fileName,
      fileSize,
      fileType,
      success,
    })
  }

  logApiCall(endpoint: string, method: string, status: number, duration: number) {
    this.info('API call', {
      endpoint,
      method,
      status,
      duration,
    })
  }

  logError(error: Error, context?: any) {
    this.error(error.message, {
      stack: error.stack,
      context,
    })
  }

  // Private methods
  private getCurrentUserId(): string | undefined {
    // This would typically come from your auth context
    return undefined
  }

  private getClientIP(): string {
    // In a real app, this would come from the server
    return 'client-ip'
  }

  // Get recent logs
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count)
  }

  // Clear logs
  clearLogs() {
    this.logs = []
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Security event logger
export class SecurityLogger {
  static logFailedLogin(email: string, ip?: string) {
    logger.security('Failed login attempt', { email, ip })
  }

  static logSuccessfulLogin(email: string, userId: string, ip?: string) {
    logger.security('Successful login', { email, userId, ip })
  }

  static logPasswordReset(email: string, ip?: string) {
    logger.security('Password reset requested', { email, ip })
  }

  static logSuspiciousActivity(activity: string, details: any) {
    logger.security('Suspicious activity detected', { activity, details })
  }
}

// Performance logger
export class PerformanceLogger {
  private static metrics: Map<string, number[]> = new Map()

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)
  }

  static getAverage(name: string): number {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  static logDatabaseQuery(query: string, duration: number) {
    logger.debug('Database query', {
      query: query.substring(0, 50) + '...',
      duration,
    })
    this.recordMetric('db_query_duration', duration)
  }

  static logApiResponse(endpoint: string, duration: number, status: number) {
    logger.debug('API response', {
      endpoint,
      duration,
      status,
    })
    this.recordMetric('api_response_duration', duration)
  }
}

// Audit logger
export class AuditLogger {
  static logUserAction(action: string, userId: string, details: any) {
    logger.security('User action', {
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  static logDataAccess(resource: string, userId: string, action: string) {
    logger.security('Data access', {
      resource,
      userId,
      action,
      timestamp: new Date().toISOString(),
    })
  }

  static logPermissionCheck(resource: string, userId: string, granted: boolean) {
    logger.security('Permission check', {
      resource,
      userId,
      granted,
      timestamp: new Date().toISOString(),
    })
  }
}
