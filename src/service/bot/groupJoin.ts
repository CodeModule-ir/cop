import { Context } from "grammy";
import { AppDataSource } from "../../config/db";
import { GroupSettings } from "../../entities/GroupSettings";
import { GroupMembership } from "../../entities/GroupMembership";
import { User } from "../../entities/User";
import { Logger } from "../../config/logger";
import { MESSAGE } from "../../helper/message";
import { BlacklistService } from "../command/blacklist";
const logger = new Logger({ file: "join_group.log", level: "info" });

export async function groupJoin(ctx: Context) {
  const chat = ctx.chat!;
  const from = ctx.from;

  if (ctx.myChatMember?.new_chat_member?.status === "member") {
    try {
      const groupRepo = AppDataSource.getRepository(GroupSettings);
      let groupSettings = await groupRepo.findOne({
        where: { group_id: chat.id },
      });
      // Create or update the group settings
      if (!groupSettings) {
        groupSettings = groupRepo.create({
          group_id: chat.id,
          group_name: chat.title,
          welcome_message: "",
          chat_permissions: (await ctx.api.getChat(chat.id)).permissions,
          rules: "",
          description: "",
          black_list: [],
          added_by_id: from?.id,
        });

        await groupRepo.save(groupSettings);
        logger.info(
          `Bot added to group ${chat.title} by ${from?.username}`,
          "GROUP"
        );

        // Initialize blacklist terms from BlackListJson
        await BlacklistService.storeBlacklistTerms(groupSettings);
      } else {
        logger.info(
          `Bot re-added to existing group ${chat.title} by ${from?.username}`,
          "GROUP"
        );
      }

      // Add the user who added the bot to the group as an admin
      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({
        where: { telegram_id: from?.id },
      });

      if (!user) {
        user = userRepo.create({
          telegram_id: from?.id!,
          role: "admin",
        });

        await userRepo.save(user);
      } else {
        // Update user role if needed
        if (user.role !== "admin") {
          user.role = "admin";
          await userRepo.save(user);
        }
      }

      // Create a GroupMembership record
      const membershipRepo = AppDataSource.getRepository(GroupMembership);
      let membership = await membershipRepo.findOne({
        where: { group: { id: groupSettings.id }, user: { id: user.id } },
      });

      if (!membership) {
        membership = membershipRepo.create({
          group: groupSettings,
          user: user,
          is_admin: true,
        });

        await membershipRepo.save(membership);
      }
      await ctx.reply(MESSAGE.newGroupJoin(ctx, from?.username!));
    } catch (error: any) {
      logger.error("Failed to save group settings", error, "GROUP");
    }
  }
}
