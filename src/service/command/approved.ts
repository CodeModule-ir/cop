import { Context } from "grammy";
import { UserService } from "../db/user";
import { GroupSettingsService } from "../db/group";
import { GroupMembershipService } from "../db/group/Membership";
import { ApprovedUserService } from "../db/user/Approved";
import { Permissions } from "./Permissions";

export class Approved {
  private static userRepo: UserService = new UserService();
  private static approvedUserRepo: ApprovedUserService =
    new ApprovedUserService();
  private static groupSettingsRepo: GroupSettingsService =
    new GroupSettingsService();
  private static groupMembershipRepo: GroupMembershipService =
    new GroupMembershipService();

  // Helper method to fetch the user and group settings
  private static async getEntities(ctx: Context) {
    const userId = ctx.message?.reply_to_message?.from?.id!;
    const chatId = ctx.chat?.id!;

    const user = await this.userRepo.getByTelegramId(userId);
    const groupSettings = await this.groupSettingsRepo.getByGroupId(chatId);

    return { userId, chatId, user, groupSettings };
  }

  static async add(ctx: Context) {
    const { userId, chatId, user, groupSettings } = await this.getEntities(ctx);

    if (user) {
      return ctx.reply("This user is already approved.");
    }

    if (!groupSettings) {
      return ctx.reply("Group settings not found.");
    }
    // Add user to the approved list
    const approvedUser = await this.approvedUserRepo.create({
      group: groupSettings,
      user_id: userId,
      username: ctx.message?.reply_to_message?.from?.username!,
    });

    await this.approvedUserRepo.save(approvedUser);
    // Grant full permissions
    await ctx.restrictChatMember(userId, Permissions.APPROVED_USER());

    // Send a confirmation message
    await ctx.reply(
      "The user has been approved and given full messaging permissions.",
      {
        reply_to_message_id: ctx.message?.message_id,
      }
    );
  }

  static async remove(ctx: Context) {
      const { userId, chatId, groupSettings } = await this.getEntities(ctx);

      if (!groupSettings) {
        return ctx.reply("Group settings not found.");
      }

      // Remove user from the approved list
      const approvedUser = await this.approvedUserRepo.getByIdAndGroup(userId,groupSettings)

      if (approvedUser) {
        await this.approvedUserRepo.remove(approvedUser.id);
      }

      // Restrict permissions
      await ctx.restrictChatMember(userId,Permissions.APPROVED_USER(false));

      // Send a confirmation message
      await ctx.reply(
        "The user's approval has been removed, and their permissions have been restricted.",
        {
          reply_to_message_id: ctx.message?.message_id,
        }
      );
  }
}
