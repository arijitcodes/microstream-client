import chalk from "chalk";

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

  private formatMessage(level: LogLevel, ...args: any[]): string {
    if (level === "silent") {
      return ""; // Skip formatting for "silent" logs
    }

    const prefix = chalk.magenta(`[MicroStream Client]`);
    const timestamp = chalk.gray(`[${new Date().toISOString()}]`);

    // Define levelLabel with a default value
    const levelLabel =
      {
        debug: chalk.greenBright,
        info: chalk.cyan,
        warn: chalk.yellow,
        error: chalk.red,
      }[level] || chalk.white; // Default to white if level is invalid

    const formattedLevel = levelLabel(`[${level.toUpperCase()}]`);
    const message = args
      .map((arg) =>
        arg instanceof Error
          ? arg.stack
          : typeof arg === "object"
          ? JSON.stringify(arg, null, 2)
          : arg
      )
      .join(" ");
    return `${prefix}${timestamp}${formattedLevel} ${message}`;
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
