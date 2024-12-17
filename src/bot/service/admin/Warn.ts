import { Context } from 'grammy';
import { AdminValidationService } from './validation';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
import { MuteService } from './Mute';

export class WarnService {
  static async warnUser(ctx: Context): Promise<{
    warningApplied: boolean;
    isWarningLimitReached: boolean;
    warnings: number;
  }> {
    const validationResult = await AdminValidationService.validateContext(ctx);
    if (!validationResult) {
      return {
        warningApplied: false,
        isWarningLimitReached: false,
        warnings: 0,
      };
    }
    const { groupId, userId } = validationResult;
    const services = ServiceProvider.getInstance();
    const input = ctx.message?.text!.split(/\s+/).slice(1);
    const reason = input!.join(' ')?.toLowerCase() || 'reason is not set for warning';
    const [groupService, userService, warnService] = await Promise.all([services.getGroupService(), services.getUserService(), services.getWarnsService()]);
    let group = (await groupService.getByGroupId(groupId))!;
    let user = (await userService.getByTelegramId(userId))!;
    let warn = await warnService.getByGroupId(groupId);
    if (!warn) {
      warn = await warnService.save(group.id, user.id, reason);
    }

    const warningsGroup = [...group.warnings.map(Number)];
    if (!warningsGroup.includes(+user.telegram_id)) {
      warningsGroup.push(+user.telegram_id);
    }
    // Remove the user from the group's approved_users and members arrays
    const updatedGroup = {
      ...group,
      warnings: warningsGroup,
    };
    const updatedUser = {
      ...user,
      warnings: Number(user.warnings) + 1, // Increment user warnings
    };
    const updatedWarning = {
      ...warn,
      reason: reason,
    };
    if (updatedUser.warnings >= 3) {
      // Reset the warnings count and clear the user from the group's warning list
      const updatedGroup = {
        ...group,
        warnings: group.warnings.filter((id: number) => Number(id) !== Number(user.telegram_id)),
      };
      const updatedUser = {
        ...user,
        warnings: 0,
      };
      await warnService.delete(warn.id);
      await Promise.all([groupService.update(updatedGroup), userService.update(updatedUser)]);
      await MuteService.muteUser(ctx, '1d');
      return {
        warningApplied: true,
        isWarningLimitReached: true,
        warnings: 0,
      };
    }
    await Promise.all([groupService.update(updatedGroup), userService.update(updatedUser), warnService.update(updatedWarning)]);
    return {
      warningApplied: true,
      isWarningLimitReached: false,
      warnings: updatedUser.warnings,
    };
  }
  static async removeWarn(ctx: Context): Promise<{ warningRemoved: boolean; warnings: number }> {
    const validationResult = await AdminValidationService.validateContext(ctx);
    if (!validationResult) {
      return { warningRemoved: false, warnings: 0 };
    }

    const { userId } = validationResult;
    const services = ServiceProvider.getInstance();
    const userService = await services.getUserService();
    let user = (await userService.getByTelegramId(userId))!;
    const updatedUser = {
      ...user,
      warnings: user.warnings - 1,
    };
    await userService.update(updatedUser);
    return {
      warningRemoved: true,
      warnings: updatedUser.warnings,
    };
  }
  static async getUserWarnById(ctx: Context, userId: number): Promise<{ warnings: number }> {
    const services = ServiceProvider.getInstance();
    const userService = await services.getUserService();
    let user = await userService.getByTelegramId(userId);
    let replyMessage = ctx.message?.reply_to_message?.from;
    const userData = { first_name: replyMessage?.first_name!, id: userId, username: replyMessage?.username! };
    if (!user) {
      user = await userService.save(userData);
    }
    return { warnings: user.warnings };
  }
  static async getAllWarns(ctx: Context): Promise<string> {
    const replyMessage = ctx.from;
    // Ensure the user ID of the replied message is valid
    const userId = replyMessage!.id!;
    const chat = ctx.chat;
    const groupId = chat?.id!;

    // Initialize services
    const services = ServiceProvider.getInstance();
    const [groupService, userService, warnService] = await Promise.all([services.getGroupService(), services.getUserService(), services.getWarnsService()]);
    let group = await groupService.getByGroupId(groupId);
    let user = await userService.getByTelegramId(userId);
    const userData = { first_name: ctx!.message?.reply_to_message?.from?.first_name!, id: userId, username: ctx.message?.reply_to_message?.from?.username! };
    if (!user) {
      user = await userService.save(userData);
    }
    if (!group) {
      group = await groupService.save(ctx);
    }
    let warn = await warnService.getByGroupId(groupId);
    if (!warn) {
      warn = await warnService.save(group.id, user.id, 'The reason for the warning is not specified');
    }
    // Get all users from the group's warning list
    const usersWithWarnings: { first_name: string; userId: string; warnings: number; reason: string }[] = [];
    for (const userId of group.warnings) {
      const user = await userService.getByTelegramId(userId);
      if (user) {
        const reason = warn.reason;
        usersWithWarnings.push({
          first_name: user.first_name,
          userId: `${user.telegram_id}`,
          warnings: user.warnings,
          reason: reason || 'No specific reason provided',
        });
      }
    }
    console.log('usersWithWarnings', JSON.stringify(usersWithWarnings, null, 2));

    // Generate structured output
    let output = `**Group Warning Report**\n`;
    output += `Group ID: ${groupId}\n\n`;
    output += `**Users with Warnings:**\n`;

    usersWithWarnings.forEach((user, index) => {
      output += `\n${index + 1}. Name: ${user.first_name}\n`;
      output += `   User ID: ${user.userId}\n`;
      output += `   Warnings: ${user.warnings}\n`;
      output += `   Last Reason: ${user.reason}\n`;
    });
    output += `\n---\nTotal Users with Warnings: ${usersWithWarnings.length}\n`;

    return output;
  }
}
