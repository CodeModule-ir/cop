import { Bot } from 'grammy';
import {Command } from './controller/command';
// import { welcomeNewMember } from './api/welcome';
// import { automatedResponses } from './api/responses';
// import { logActivity } from './api/logging';
// import { addCustomCommand, executeCustomCommand } from './api/customCommands';
import { checkAdmin } from './middleware/isAdmin';
import { ManagementGroup } from './controller/manager';
import { AppDataSource } from './config/db';
import { logger } from './helper/logging';

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// bot.command('start', Command.start);
// bot.command('help', Command.help);
// bot.command('admins', Command.admins);

bot.command('warn', checkAdmin, ManagementGroup.warn);
// bot.command('mute', checkAdmin, handleMuteCommand);
// bot.command('ban', checkAdmin, handleBanCommand);
// bot.command('addcommand', checkAdmin, addCustomCommand);

// bot.on('message:new_chat_members', welcomeNewMember);
// bot.on('message', automatedResponses);
// bot.on('message', logActivity);
// bot.on('message', executeCustomCommand);

(async () => {
    try {
        await AppDataSource.initialize();
        logger.info('DATABASE INITIALIZED','DATABASE')
        bot.start();
        logger.info("BOT STARTED","APP");
    } catch (error:any) {
        logger.error('ERROR FROM START APP',error,'APP')
    }
})();