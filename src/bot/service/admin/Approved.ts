import { Context } from 'grammy';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
import logger from '../../../utils/logger';
export class ApprovedService {
  static async updateApproved(groupId: number, userId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    if (!groupService || !userService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    let user = await userService.getByTelegramId(userId);
    let group = await groupService.getByGroupId(groupId);
    const approvedUsers = group!.approved_users ? [...group!.approved_users.map(Number)] : [];
    if (approvedUsers.includes(userId)) {
      return false;
    }
    const approvedGroups = user!.approved_groups ? [...user!.approved_groups.map(Number)] : [];
    if (!approvedUsers.includes(userId)) {
      approvedUsers.push(userId);
    }
    if (!approvedGroups.includes(groupId)) {
      approvedGroups.push(groupId);
    }
    const updatedUser = await userService.update({
      ...user!,
      approved_groups: approvedGroups,
      role: 'approved_user',
    });
    const updatedGroup = await groupService.update({
      ...group!,
      approved_users: approvedUsers,
    });
    return { updatedUser, updatedGroup };
  }
  static async updateDisapproved(groupId: number, userId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    if (!groupService || !userService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    // Fetch user and group data
    let user = await userService.getByTelegramId(userId);
    let group = await groupService.getByGroupId(groupId);
    // Update disapproved lists
    const approvedGroups = user!.approved_groups ? [...user!.approved_groups.map(Number)] : [];
    const approvedUsers = group!.approved_users ? [...group!.approved_users.map(Number)] : [];
    if (!approvedUsers.includes(userId) || !approvedGroups.includes(groupId)) {
      return false;
    }
    // Remove group from user's approved groups
    const updatedApprovedGroups = approvedGroups.filter((id) => id !== groupId);

    // Remove user from group's approved users
    const updatedApprovedUsers = approvedUsers.filter((id) => id !== userId);

    // Update the user and group in the database
    const updatedUser = await userService.update({
      ...user!,
      approved_groups: updatedApprovedGroups,
      role: 'user',
    });
    const updatedGroup = await groupService.update({
      ...group!,
      approved_users: updatedApprovedUsers,
    });

    return { updatedUser, updatedGroup };
  }
  static async getApprovedUsers(groupId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    if (!groupService || !userService) {
      logger.warn('services unavailable. Skipping command execution.');
      return null;
    }
    let group = (await groupService.getByGroupId(groupId))!;
    const approvedUserIds = group.approved_users ? group.approved_users.map(Number) : [];
    const approvedUsers = [];
    for (const userId of approvedUserIds) {
      const user = await userService.getByTelegramId(userId);
      if (user) {
        approvedUsers.push(user);
      }
    }
    return approvedUsers;
  }
  private static async getServices() {
    const service = ServiceProvider.getInstance();
    const userService = await service.getUserService();
    const groupService = await service.getGroupService();
    return {
      userService,
      groupService,
    };
  }
}
