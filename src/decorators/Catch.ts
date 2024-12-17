import { ErrorResponse } from '../types/ResponseTypes';
import logger from '../utils/logger';
import { createDecorator } from './index';
import { isGrammyError } from '../errors/decoratorErrorHandler';
export function Catch(customResponse?: ErrorResponse) {
  return createDecorator(async (ctx, next) => {
    try {
      await next();
      return;
    } catch (error: any) {
      if (isGrammyError(error)) {
        if (error.error_code === 400 && error.description === 'Bad Request: message to be replied not found') {
          console.warn(`Message not found to reply to. Skipping...`);
          return;
        }
        if (error.error_code === 403 && error.description.includes('bot was kicked')) {
          logger.warn(`Bot was kicked from a group (chat_id: ${error.payload?.chat_id || 'unknown'}). Skipping.`);
          return;
        }
      }
      if (!isGrammyError(error)) {
        logger.error(`Unhandled error: ${error.message || 'No error message provided'}`);
        if (error.stack) {
          logger.debug(`Stack trace: ${error.stack}`);
        }
      }
      // Custom response or default error message
      const errorResponse: ErrorResponse = customResponse || {
        message: error.message || 'An unknown error occurred.',
        statusCode: error.statusCode || 500,
        category: 'General',
      };
      const category = typeof errorResponse.category === 'string' ? errorResponse.category : 'General';
      logger.error(`[Category: ${category}] : ${error.message}`);
    }
  });
}
