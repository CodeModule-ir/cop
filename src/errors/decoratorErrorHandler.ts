import { GrammyError } from 'grammy';
import logger from '../utils/logger';

export function handleDecoratorError(error: any) {
  if (error instanceof GrammyError) {
    handleGrammyError(error);
  } else if (error instanceof SyntaxError) {
    logger.error(`🛑 Syntax Error: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
  } else if (error instanceof TypeError) {
    logger.error(`🛑 Type Error: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
  } else if (error instanceof ReferenceError) {
    logger.error(`🛑 Reference Error: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
  } else if (error instanceof RangeError) {
    logger.error(`🛑 Range Error: ${error.message}`);
    logger.debug(`Stack trace: ${error.stack}`);
  } else {
    logger.error(`❌ Unexpected error: ${error.message || 'No error message provided'}`);
    if (error.stack) {
      logger.debug(`Stack trace: ${error.stack}`);
    }
  }
}

// Handle Grammy-specific errors
function handleGrammyError(error: GrammyError) {
  switch (error.error_code) {
    case 400:
      if (error.description.includes('message to be replied not found')) {
        console.warn('⚠️ Message to reply to not found. Skipping execution.');
      } else if (error.description.includes('chat not found')) {
        console.warn('⚠️ Chat not found. Ensure the bot has access to the chat.');
      } else if (error.description.includes('invalid user ID')) {
        console.warn('⚠️ Invalid user ID provided. Skipping operation.');
      } else {
        logger.warn(`⚠️ Bad Request: ${error.description}`);
      }
      break;
    case 403:
      if (error.description.includes('bot was kicked')) {
        logger.warn('🚨 Bot was kicked from a group. Skipping this operation.');
      } else if (error.description.includes('bot is not an admin')) {
        logger.warn('⚠️ Bot lacks necessary admin rights to perform this action.');
      } else {
        logger.warn(`⚠️ Forbidden: ${error.description}`);
      }
      break;
    case 404:
      logger.warn('⚠️ Resource not found. Check the chat ID or user ID.');
      break;
    case 429:
      logger.warn('⚠️ Too Many Requests: The bot is being rate-limited by Telegram.');
      break;
    case 500:
      logger.error('🚨 Internal Server Error from Telegram. Retrying might help.');
      break;
    case 502:
      logger.error('🚨 Bad Gateway: Telegram server is temporarily unavailable.');
      break;
    default:
      logger.error(`❌ Unexpected GrammyError (Code ${error.error_code}): ${error.description}`);
  }
}
