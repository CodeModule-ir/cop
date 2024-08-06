import { Logger } from "../config/logger"; // Adjust the import path as necessary

// Initialize the logger
const logger = new Logger({
  file: "application.log",
  level: "info",
  timestampFormat: "locale",
});
export function LogExecution() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodName = propertyKey;
      const className = target.constructor.name;
      const context = (this as any)?.ctx || args[0]; 
      // Log method entry
      logger.info(`Entering ${className}.`, `${methodName}`, { context, args });

      const result = await originalMethod.apply(this, args);

      // Log method exit
      logger.info(`Exiting ${className}.`, `${methodName}`, {
        context,
        result,
      });
      return result;
    };

    return descriptor;
  };
}
