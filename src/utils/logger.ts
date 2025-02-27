export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export default class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = "info") {
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ["debug", "info", "warn", "error", "silent"];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatMessage(level: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[MicroStream Client][${timestamp}][${level.toUpperCase()}] ${args.join(
      " "
    )}`;
  }

  debug(...args: any[]) {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", ...args));
    }
  }

  info(...args: any[]) {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", ...args));
    }
  }

  warn(...args: any[]) {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", ...args));
    }
  }

  error(...args: any[]) {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", ...args));
    }
  }
}
