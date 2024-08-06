import { Context } from "grammy";
import { UserService } from "../db/user";
import { GroupSettingsService } from "../db/group";
import { ApprovedUserService } from "../db/user/Approved";
import { Permissions } from "./Permissions";
import { initGroupSetting } from "../../decorators/db";

export class Approved {
  private static userRepo: UserService = new UserService();
  private static approvedUserRepo: ApprovedUserService =
    new ApprovedUserService();
  private static groupSettingsRepo: GroupSettingsService =
    new GroupSettingsService();
  // Helper method to fetch the user and group settings
  private static async getEntities(ctx: Context) {
    const userId = ctx.message?.reply_to_message?.from?.id!;
    const chatId = ctx.chat?.id!;

    const user = await this.userRepo.getByTelegramId(userId);
    const groupSettings = await this.groupSettingsRepo.getByGroupId(chatId);

    return { userId, chatId, user, groupSettings };
  }
  @initGroupSetting()
  static async add(ctx: Context) {
    const { userId,  user, groupSettings } = await this.getEntities(ctx);

    if (user) {
      return ctx.reply("This user is already approved.");
    }
    // Add user to the approved list
    const approvedUser = await this.approvedUserRepo.create({
      group: groupSettings!,
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
  @initGroupSetting()
  static async remove(ctx: Context) {
    const { userId, groupSettings } = await this.getEntities(ctx);
    // Remove user from the approved list
    const approvedUser = await this.approvedUserRepo.getByIdAndGroup(
      userId,
      groupSettings!.id!
    );
    if (approvedUser) {
      await this.approvedUserRepo.remove(approvedUser.id);
    }

    // Restrict permissions
    await ctx.restrictChatMember(userId, Permissions.APPROVED_USER(false));

    // Send a confirmation message
    await ctx.reply(
      "The user's approval has been removed, and their permissions have been restricted.",
      {
        reply_to_message_id: ctx.message?.message_id,
      }
    );
  }
  @initGroupSetting()
  static async list(ctx: Context) {
    const { chatId } = await this.getEntities(ctx);
    const updatedGroupSettings = await Approved.groupSettingsRepo.getByGroupId(
      chatId
    );
    const approvedUsers = await this.approvedUserRepo.getByGroup(
      updatedGroupSettings!
    );
    if (!approvedUsers || approvedUsers.length === 0) {
      await ctx.reply("There are no approved users in this group.");
      return;
    }

    // Format the list of approved users
    const userList = approvedUsers
      .map((user) => {
        const username = user.username ? `@${user.username}` : "No username";
        return `- ${username}`;
      })
      .join("\n");

    // Send the list to the chat
    await ctx.reply(`Approved users in this group:\n${userList}`, {
      reply_to_message_id: ctx.message?.message_id,
    });
  }
}
