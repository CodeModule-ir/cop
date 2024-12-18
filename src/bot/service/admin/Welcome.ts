import { Context } from 'grammy';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
import { Group } from '../../../types/database/TablesTypes';
import logger from '../../../utils/logger';
export class GroupSettingsService {
  static async getWelcomeMessage(ctx: Context, welcomeContent: string): Promise<Group['welcome_message'] | null> {
    const { groupService } = await GroupSettingsService.getServices();
    if (!groupService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    const groupId = ctx.chat?.id!;
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx);
    }
    return group.welcome_message;
  }
  static async removeWelcomeMessage(ctx: Context): Promise<string | null> {
    const { groupService } = await GroupSettingsService.getServices();
    if (!groupService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    const groupId = ctx.chat?.id!;

    // Get the group by its ID
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      // If no group exists, create a new one
      group = await groupService.save(ctx);
    }

    // Remove the welcome message (set it to an empty string or null)
    const updatedGroup = await groupService.update({
      ...group,
      welcome_message: '',
    });

    return updatedGroup.welcome_message ? updatedGroup.welcome_message : 'The welcome message has been removed.';
  }
  static async setWelcomeMessage(ctx: Context, welcomeContent: string): Promise<string | null> {
    const { groupService } = await GroupSettingsService.getServices();
    if (!groupService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    const groupId = ctx.chat?.id!;
    // Get the group by its ID
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      // If no group exists, create a new one
      group = await groupService.save(ctx);
    }
    // Update the welcome message
    const updatedGroup = await groupService.update({
      ...group,
      welcome_message: welcomeContent,
    });
    return updatedGroup.welcome_message;
  }
  private static async getServices() {
    const service = ServiceProvider.getInstance();
    const groupService = await service.getGroupService();
    return {
      groupService,
    };
  }
}
