import { GrammyError } from 'grammy';
import { ErrorResponse } from '../types/ResponseTypes';
import logger from '../utils/logger';
import { createDecorator } from './index';
export function Catch(customResponse?: ErrorResponse) {
  return createDecorator(async (ctx, next) => {
    try {
      await next();
    } catch (error: any) {
      if (error instanceof GrammyError && error.error_code === 400 && error.description === 'Bad Request: message to be replied not found') {
        console.warn(`Message not found to reply to. Skipping...`);
        return;
      }
      if (error.error_code === 403 && error.description.includes('bot was kicked')) {
        logger.warn(`[Warning] Bot was kicked from a group (chat_id: ${error.payload.chat_id}). Skipping.`);
        return;
      }
      // Custom response or default error message
      const errorResponse: ErrorResponse = customResponse || {
        message: error.message,
        statusCode: error.statusCode || 500,
        category: 'General',
      };
      logger.error(`[Category: ${errorResponse.category}] : ${error.message}`);
    }
  });
}
