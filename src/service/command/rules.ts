import { Context } from "grammy";
import { AppDataSource } from "../../config/db";
import { Repository } from "typeorm";
import { GroupSettings } from "../../entities/GroupSettings";

export class Rules {
  static async rules(ctx: Context) {
    const groupId = ctx.chat?.id;

    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const rulesInput = String(ctx.match).trim();
    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);

    let groupSettings = await groupRepo.findOne({
      where: { group_id: groupId },
    });

    // Check if the admin wants to delete all rules
    if (rulesInput.toLowerCase() === "r") {
      if (!groupSettings || !groupSettings.rules) {
        return ctx.reply("There are no rules to delete for this group.");
      }

      groupSettings.rules = ""; // Clear the rules
      await groupRepo.save(groupSettings);
      return ctx.reply(
        `All rules have been deleted for the group "${ctx.chat.title}".`
      );
    }

    // If the user provides new rules input, update the rules
    if (rulesInput) {
      if (!groupSettings) {
        // Create new group settings if it doesn't exist
        groupSettings = groupRepo.create({
          group_id: groupId,
          group_name: ctx.chat?.title || "",
          rules: rulesInput,
          welcome_message: "",
          description: "",
          black_list: [],
          added_by_id: ctx.message?.from?.id,
        });
      } else {
        // Update the existing rules
        groupSettings.rules = rulesInput;
      }

      await groupRepo.save(groupSettings);
      return ctx.reply(
        `Group rules have been updated:\n${groupSettings.rules}`
      );
    } else {
      // If no rules input, display the existing rules
      if (!groupSettings || !groupSettings.rules) {
        return ctx.reply("No rules have been set for this group.");
      }

      return ctx.reply(
        `The rules related to "${ctx.chat.title}" are:\n${groupSettings.rules}`
      );
    }
  }
}
