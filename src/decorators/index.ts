import { Context } from 'grammy';
import { handleDecoratorError } from '../errors/decoratorErrorHandler';
export function createDecorator(middleware: (ctx: Context, next: () => Promise<void>, close: () => void) => Promise<void>) {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const ctx: Context = (this as any)?.ctx || args[0];
        let shouldContinue = true;
        const close = () => {
          shouldContinue = false;
        };
        await middleware(
          ctx,
          async () => {
            if (shouldContinue) {
              return await originalMethod.apply(this, [...args]);
            }
          },
          close
        );

        return;
      } catch (error: any) {
        handleDecoratorError(error);
      }
    };

    return descriptor;
  };
}
