import { Context } from "grammy";
import { GroupSettingsService } from "../db/group";
import { ApprovedUserService } from "../db/user/Approved";
import { Permissions } from "./Permissions";
import { initGroupSetting } from "../../decorators/db";
import { UserService } from "../db/user";

export class Approved {
  private static approvedUserRepo: ApprovedUserService =
    new ApprovedUserService();
  private static groupSettingsRepo: GroupSettingsService =
    new GroupSettingsService();
  private static userRepo: UserService = new UserService();

  // Helper method to fetch the user and group settings
  private static async getEntities(ctx: Context) {
    const userId = ctx.message?.reply_to_message?.from?.id!;
    const chatId = ctx.chat?.id!;

    const groupSettings = await this.groupSettingsRepo.getByGroupId(chatId);

    let user = await this.userRepo.getByTelegramId(userId);
    if (!user) {
      user = await this.userRepo.create({
        telegram_id: userId!,
        username: ctx.message?.reply_to_message?.from?.username!,
        role: "member",
      });
      await this.userRepo.save(user);
    }
    return { user, groupSettings };
  }

  @initGroupSetting()
  static async add(ctx: Context) {
    const { user, groupSettings } = await this.getEntities(ctx);
    // Check if the user is already approved
    const existingApproval = await this.approvedUserRepo.getByUserIdAndGroup(
      user.id,
      groupSettings!.id!
    );
    if (existingApproval) {
      return ctx.reply("This user is already approved.");
    }

    // Add user to the approved list
    const approvedUser = await this.approvedUserRepo.create({
      group: groupSettings!,
      user_id: user.telegram_id,
      username: user.username!,
      user: user,
    });
    await this.approvedUserRepo.save(approvedUser);
    if (!groupSettings!.approvedUsers) {
      groupSettings!.approvedUsers = [];
    }
    groupSettings!.approvedUsers.push(approvedUser);
    await this.groupSettingsRepo.save(groupSettings!);
    user.role = "approved";
    await this.userRepo.save(user);
    // Grant full permissions
    await ctx.restrictChatMember(user.telegram_id, Permissions.APPROVED_USER());

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
    const { user, groupSettings } = await this.getEntities(ctx);

    // Remove user from the approved list
    const approvedUser = await this.approvedUserRepo.getByUserIdAndGroup(
      user.id,
      groupSettings!.id!
    );
    if (approvedUser) {
      await this.approvedUserRepo.remove(approvedUser.id);
    }
    user.role = "member";
    await this.userRepo.save(user);
    // Restrict permissions
    await ctx.restrictChatMember(user.telegram_id, Permissions.UN_APPROVE());

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
    const chatId = ctx.chat?.id!;
    const groupSettings = await this.groupSettingsRepo.getByGroupId(chatId);
    const approvedUsers = await this.approvedUserRepo.getByGroup(
      groupSettings!
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
