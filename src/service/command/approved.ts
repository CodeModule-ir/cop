import { Context } from "grammy";
import { Repository } from "typeorm";
import { ApprovedUser } from "../../entities/ApprovedUser";
import { AppDataSource } from "../../config/db";
import { GroupSettings } from "../../entities/GroupSettings";

export class Approved {
  static async add(ctx: Context) {
    const userId = ctx.message?.reply_to_message?.from?.id;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      return ctx.reply("Please reply to the user you want to approve.");
    }

    const userRepo: Repository<ApprovedUser> =
      AppDataSource.getRepository(ApprovedUser);
    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);

    // Check if the user is already approved
    const existingApprovedUser = await userRepo.findOne({
      where: { user_id: userId, group: { group_id: chatId } },
    });

    if (existingApprovedUser) {
      return ctx.reply("This user is already approved.");
    }

    // Add user to the database
    const groupSettings = await groupRepo.findOne({
      where: { group_id: chatId },
    });

    if (!groupSettings) {
      return ctx.reply("Group settings not found.");
    }

    const approvedUser = userRepo.create({
      user_id: userId,
      username: ctx.message?.reply_to_message?.from?.username || "",
      group: groupSettings,
    });

    await userRepo.save(approvedUser);

    // Grant full permissions
    await ctx.restrictChatMember(userId, {
      can_pin_messages: true,
      can_send_other_messages: true,
      can_send_polls: true,
      can_send_messages: true,
      can_send_photos: true,
      can_invite_users: true,
      can_send_documents: true,
    });

    // Send a confirmation message
    await ctx.reply(
      "The user has been approved and given full messaging permissions.",
      {
        reply_to_message_id: ctx.message?.message_id,
      }
    );
  }

  static async remove(ctx: Context) {
    const userId = ctx.message?.reply_to_message?.from?.id;
    const chatId = ctx.chat?.id;

    if (!userId || !chatId) {
      return ctx.reply(
        "Please reply to the user you want to remove approval from."
      );
    }

    const userRepo: Repository<ApprovedUser> =
      AppDataSource.getRepository(ApprovedUser);
    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);

    // Remove user from the database
    const groupSettings = await groupRepo.findOne({
      where: { group_id: chatId },
    });

    if (!groupSettings) {
      return ctx.reply("Group settings not found.");
    }

    const approvedUser = await userRepo.findOne({
      where: { user_id: userId, group: { group_id: chatId } },
    });

    if (approvedUser) {
      await userRepo.remove(approvedUser);
    }

    // Restrict permissions
    await ctx.restrictChatMember(userId, {
      can_pin_messages: false,
      can_send_other_messages: false,
      can_send_polls: false,
      can_send_messages: false,
      can_send_photos: false,
      can_invite_users: false,
      can_send_documents: false,
    });

    // Send a confirmation message
    await ctx.reply(
      "The user's approval has been removed, and their permissions have been restricted.",
      {
        reply_to_message_id: ctx.message?.message_id,
      }
    );
  }
}
