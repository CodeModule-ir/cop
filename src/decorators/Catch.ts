import { Context } from 'grammy';
import { ErrorResponse } from '../types/ResponseTypes';
import logger from '../utils/logger';
import { ServiceProvider } from '../service/database/ServiceProvider';
export function Catch(customResponse?: ErrorResponse) {
  return function (target: any, propKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const ctx: Context = (this as any)?.ctx || args[0];
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        if (error.error_code === 403 && error.description.includes('bot was kicked')) {
          const chatId = error.payload?.chat_id;
          logger.warn(`[Warning] Bot was kicked from a group (chat_id: ${error.payload.chat_id}). Skipping.`);
          const service = ServiceProvider.getInstance();
          const groupService = await service.getGroupService();
          await groupService.delete(chatId);
          return;
        }
        // Custom response or default error message
        const errorResponse: ErrorResponse = customResponse || {
          message: error.message,
          statusCode: error.statusCode || 500,
          category: 'General',
        };
        logger.error(`[Category: ${errorResponse.category}] Error in ${target.constructor.name}.${propKey}(): ${error.message}`);
        // Send the error message to the user (if context is available)
        if (ctx && typeof ctx.reply === 'function') {
          await ctx.reply(errorResponse.message);
        }
        throw error
      }
    };

    return descriptor;
  };
}
