import { Context } from 'grammy';
import { handleDecoratorError } from '../errors/decoratorErrorHandler';
import logger from '../utils/logger';

export function createDecorator(middleware: (ctx: Context, next: () => Promise<void>, close: () => void) => Promise<void>) {
  return function (_target: any, _propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        const ctx: Context = (this as any)?.ctx || args[0];

        let shouldContinue = true;
        const close = () => {
          shouldContinue = false;
          logger.debug(`Execution stopped by close() in ${originalMethod.name}`);
        };
        return await middleware(
          ctx,
          async () => {
            if (shouldContinue) {
              try {
                return await originalMethod.apply(this, args);
              } catch (error) {
                handleDecoratorError(error);
              }
            }
          },
          close
        );
      } catch (error) {
        handleDecoratorError(error);
      }
    };

    return descriptor;
  };
}
