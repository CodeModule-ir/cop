import { Context } from 'grammy';
import { ServiceProvider } from '../../../service/database/ServiceProvider';
export class ApprovedService {
  static async updateApproved(ctx: Context, groupId: number, userId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    let user = await userService.getByTelegramId(userId);
    let group = await groupService.getByGroupId(groupId);
    const userData = { first_name: ctx!.message?.reply_to_message?.from?.first_name!, id: userId, username: ctx.message?.reply_to_message?.from?.username! };
    if (!user) {
      user = await userService.save(userData);
    }
    if (!group) {
      group = await groupService.save(ctx);
    }
    const approvedGroups = user.approved_groups ? [...user.approved_groups] : [];
    const approvedUsers = group.approved_users ? [...group.approved_users.map(Number)] : [];

    if (!approvedUsers.includes(userId)) {
      approvedUsers.push(userId);
    }
    if (!approvedGroups.includes(groupId)) {
      approvedGroups.push(groupId);
    }
    const updatedUser = await userService.update({
      ...user,
      approved_groups: approvedGroups,
    });
    const updatedGroup = await groupService.update({
      ...group,
      approved_users: approvedUsers,
    });
    return { updatedUser, updatedGroup };
  }
  static async updateDisapproved(ctx: Context, groupId: number, userId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    // Fetch user and group data
    let user = await userService.getByTelegramId(userId);
    let group = await groupService.getByGroupId(groupId);
    const userData = { first_name: ctx!.message?.reply_to_message?.from?.first_name!, id: userId, username: ctx.message?.reply_to_message?.from?.username! };
    if (!user) {
      user = await userService.save(userData);
    }
    if (!group) {
      group = await groupService.save(ctx);
    }
    // Update disapproved lists
    const approvedGroups = user.approved_groups ? [...user.approved_groups] : [];
    const approvedUsers = group.approved_users ? [...group.approved_users.map(Number)] : [];

    // Remove group from user's approved groups
    const updatedApprovedGroups = approvedGroups.filter((id) => id !== groupId);

    // Remove user from group's approved users
    const updatedApprovedUsers = approvedUsers.filter((id) => id !== userId);

    // Update the user and group in the database
    const updatedUser = await userService.update({
      ...user,
      approved_groups: updatedApprovedGroups,
    });
    const updatedGroup = await groupService.update({
      ...group,
      approved_users: updatedApprovedUsers,
    });

    return { updatedUser, updatedGroup };
  }
  static async getApprovedUsers(ctx: Context, groupId: number) {
    const { groupService, userService } = await ApprovedService.getServices();
    let group = await groupService.getByGroupId(groupId);

    if (!group) {
      group = await groupService.save(ctx);
    }
    const approvedUserIds = group.approved_users ? group.approved_users.map(Number) : [];
    const approvedUsers = [];
    for (const userId of approvedUserIds) {
      const user = await userService.getByTelegramId(userId);
      if (user) {
        approvedUsers.push(user);
      }
    }
    console.log('approvedUsers', approvedUsers);

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
