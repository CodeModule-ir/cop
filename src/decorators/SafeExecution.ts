import { Context } from "grammy";
import { handleError } from "../helper";
export function SafeExecution() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const ctx: Context = (this as any)?.ctx || args[0];
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        await handleError(ctx, error, propertyKey);
      }
    };

    return descriptor;
  };
}
