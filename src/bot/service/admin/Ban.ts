import { Context } from 'grammy';
import { AdminValidationService } from './validation';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
import logger from '../../../utils/logger';

export class BanService {
  static async ban(ctx: Context): Promise<boolean> {
    const validationResult = await AdminValidationService.validateContext(ctx);
    if (!validationResult) {
      return false;
    }

    const { groupId, userId } = validationResult;
    const services = ServiceProvider.getInstance();
    const [groupService, userService] = await Promise.all([services.getGroupService(), services.getUserService()]);
    if (!groupService || !userService) {
      logger.warn('services unavailable. Skipping command execution.');
      return false;
    }
    let group = await groupService.getByGroupId(groupId);
    let user = await userService.getByTelegramId(userId);
    // If the user is part of the group, proceed with the removal
    if (group && user) {
      // Remove the user from the group's approved_users and members arrays
      const updatedGroup = {
        ...group,
        approved_users: group.approved_users.filter((id: number) => Number(id) !== userId),
        members: group.members.filter((id: number) => Number(id) !== userId),
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
    const validationResult = await AdminValidationService.validateContext(ctx);
    if (!validationResult) {
      return false;
    }
    const { groupId, userId } = validationResult;
    await ctx.api.unbanChatMember(groupId, userId);
    return true;
  }
}
