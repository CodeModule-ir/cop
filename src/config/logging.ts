import * as fs from "fs";
import * as path from "path";
import * as util from "util";
import { promisify } from "util";

const writeFile = promisify(fs.appendFile);
const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);

type LogLevel = "info" | "warn" | "error" | "debug";

interface LoggerOptions {
  level?: LogLevel;
  file?: string;
  jsonFormat?: boolean;
  timestampFormat?: "iso" | "locale";
  rotation?: {
    enabled: boolean;
    maxSize: number;
    maxFiles: number;
  };
  externalLogStream?: (message: string) => void;
  errorHandling?: {
    file: string;
    console: boolean;
  };
  customFormatter?: (logObject: any) => string;
}

const logLevels: Record<LogLevel, number> = {
  info: 1,
  warn: 2,
  error: 3,
  debug: 4,
};

const defaultOpts: LoggerOptions = {
  level: "info",
  jsonFormat: false,
  timestampFormat: "iso",
  rotation: {
    enabled: false,
    maxSize: 10485760, // 10 MB
    maxFiles: 5,
  },
  errorHandling: {
    file: "error.log",
    console: true,
  },
};

const logColors: Record<LogLevel, string> = {
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  debug: "\x1b[34m", // blue
};

const resetColor = "\x1b[0m";

const getFormattedTimestamp = (format: "iso" | "locale"): string => {
  const now = new Date();
  return format === "locale"
    ? `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
    : now.toISOString().replace("T", " ").replace("Z", "");
};

export class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private fileStream?: fs.WriteStream;
  private jsonFormat: boolean;
  private logFilePath: string = "/";
  private timestampFormat: "iso" | "locale";
  private lastCategory?: string;
  private rotation: { enabled: boolean; maxSize: number; maxFiles: number };
  private errorHandling: { file: string; console: boolean };
  private externalLogStream?: (message: string) => void;
  private customFormatter?: (logObject: any) => string;

  private constructor(options: LoggerOptions = defaultOpts) {
    this.level = options.level || defaultOpts.level!;
    this.jsonFormat = options.jsonFormat ?? defaultOpts.jsonFormat!;
    this.timestampFormat =
      options.timestampFormat ?? defaultOpts.timestampFormat!;
    this.rotation = options.rotation ?? defaultOpts.rotation!;
    this.errorHandling = options.errorHandling ?? defaultOpts.errorHandling!;
    this.externalLogStream = options.externalLogStream;
    this.customFormatter = options.customFormatter;

    if (options.file) {
      this.initializeFileLogging(options.file);
    }
  }

  public static getInstance(options?: LoggerOptions): Logger {
    if (
      !Logger.instance ||
      (options && options.file && !Logger.instance.fileStream)
    ) {
      Logger.instance = new Logger(options || defaultOpts);
    }
    return Logger.instance;
  }

  private async initializeFileLogging(logFile: string) {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      await mkdir(logsDir);
    }
    this.logFilePath = path.join(logsDir, logFile);
    this.fileStream = fs.createWriteStream(this.logFilePath, { flags: "a" });
    this.fileStream.on("error", (err) => this.handleFileStreamError(err));
  }

  private handleFileStreamError(err: Error) {
    if (this.errorHandling.console) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
    if (this.errorHandling.file) {
      writeFile(
        path.join(process.cwd(), "logs", this.errorHandling.file),
        `Failed to write to log file: ${err.message}\n`
      );
    }
    this.fileStream = undefined;
  }

  private getTimestamp(): string {
    return getFormattedTimestamp(this.timestampFormat);
  }

  private formatMessage(
    message: string,
    level: LogLevel,
    category?: string,
    meta?: any
  ): string {
    const logObject = {
      timestamp: this.getTimestamp(),
      level,
      category,
      message,
      meta,
    };

    if (this.customFormatter) {
      return this.customFormatter(logObject);
    }

    if (this.jsonFormat) {
      return JSON.stringify(logObject);
    }

    const formattedCategory = category ? `[${category.toUpperCase()}]` : "";
    return `[${
      logObject.timestamp
    }] [${logObject.level.toUpperCase()}] ${formattedCategory}: ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels[level] >= logLevels[this.level];
  }

  private async logToFile(message: string): Promise<void> {
    if (this.fileStream) {
      await writeFile(this.logFilePath, `${message}\n`);

      if (this.rotation?.enabled) {
        this.rotateFileIfNeeded();
      }
    }
  }

  private rotateFileIfNeeded(): void {
    if (this.fileStream && this.logFilePath) {
      stat(this.logFilePath).then((stats) => {
        if (stats.size >= this.rotation!.maxSize) {
          this.fileStream!.end();
          this.rotateFiles();
          this.initializeFileLogging(path.basename(this.logFilePath!));
        }
      });
    }
  }

  private async rotateFiles(): Promise<void> {
    const logFileBase = path.basename(this.logFilePath!);
    const logFileDir = path.dirname(this.logFilePath!);

    for (let i = this.rotation!.maxFiles - 1; i > 0; i--) {
      const oldFile = path.join(logFileDir, `${logFileBase}.${i}`);
      const newFile = path.join(logFileDir, `${logFileBase}.${i + 1}`);
      if (fs.existsSync(oldFile)) {
        await rename(oldFile, newFile);
      }
    }

    const firstBackup = path.join(logFileDir, `${logFileBase}.1`);
    await rename(this.logFilePath!, firstBackup);
  }

  private log(
    message: string,
    level: LogLevel,
    category?: string,
    meta?: any
  ): void {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatMessage(
        message,
        level,
        category,
        meta
      );

      if (this.externalLogStream) {
        this.externalLogStream(formattedMessage);
      }

      if (this.jsonFormat || this.customFormatter) {
        console.log(formattedMessage);
      } else {
        console.log(`${logColors[level]}${formattedMessage}${resetColor}\n`);
      }

      this.logToFile(formattedMessage);
    }
  }

  public info(message: string, category?: string, meta?: any): void {
    this.log(message, "info", category, meta);
  }

  public warn(message: string, category?: string, meta?: any): void {
    this.log(message, "warn", category, meta);
  }

  public error(
    message: string,
    error?: Error,
    category?: string,
    meta?: any
  ): void {
    const errorMessage = error
      ? `${message}\nStack Trace: ${util.inspect(error.stack)}`
      : message;
    this.log(errorMessage, "error", category, meta);
  }

  public debug(message: string, category?: string, meta?: any): void {
    this.log(message, "debug", category, meta);
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public setJsonFormat(jsonFormat: boolean): void {
    this.jsonFormat = jsonFormat;
  }

  public setTimestampFormat(format: "iso" | "locale"): void {
    this.timestampFormat = format;
  }

  public closeFileStream(): void {
    if (this.fileStream) {
      this.fileStream.end();
    }
  }
}
export const logger = Logger.getInstance();
