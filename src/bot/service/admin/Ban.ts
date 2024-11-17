import { Context } from 'grammy';
import { AdminValidationService } from './validation';
import { ServiceProvider } from '../../../service/database/ServiceProvider';

export class BanService {
  static async ban(ctx: Context): Promise<boolean> {
    const validationResult = await AdminValidationService.validateContext(ctx);
    if (!validationResult) {
      return false;
    }
    const { groupId, userId } = validationResult;
    const services = ServiceProvider.getInstance();
    const [groupService, userService] = await Promise.all([services.getGroupService(), services.getUserService()]);
    let group = await groupService.getByGroupId(groupId);
    let user = await userService.getByTelegramId(userId);
    const userData = { first_name: ctx!.message?.reply_to_message?.from?.first_name!, id: userId, username: ctx.message?.reply_to_message?.from?.username! };
    if (!user) {
      user = await userService.save(userData);
    }
    if (!group) {
      group = await groupService.save(ctx);
    }
    // If the user is part of the group, proceed with the removal
    if (group && user) {
      // Remove the user from the group's approved_users and members arrays
      const updatedGroup = {
        ...group,
        approved_users: group.approved_users.filter((id) => Number(id) !== userId),
        members: group.members.filter((id) => Number(id) !== userId),
      };
      await groupService.update(updatedGroup);
      await userService.delete(userId);
      return true;
    } else {
      // If the group or user is not found, send an error message
      return false;
    }
  }
  static async unBan(ctx: Context): Promise<boolean> {
    const userIdToUnban = ctx.message?.reply_to_message?.from?.id!;
    if (!userIdToUnban) {
      return false;
    }
    await ctx.api.unbanChatMember(ctx.chat?.id!, ctx.message?.reply_to_message?.from!.id!);
    return true;
  }
}
