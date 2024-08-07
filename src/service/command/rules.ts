import { Context } from "grammy";
import { GroupSettingsService } from "../db/group";
import { initGroupSetting } from "../../decorators/db";

export class Rules {
  @initGroupSetting()
  static async rules(ctx: Context) {
    const groupId = ctx.chat?.id;

    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const rulesInput = String(ctx.match).trim();
    const groupRepo: GroupSettingsService = new GroupSettingsService();

    let groupSettings = await groupRepo.getByGroupId(groupId);

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
      groupSettings!.rules +="\n"+ rulesInput;
      await groupRepo.save(groupSettings!);
      return ctx.reply(
        `Group rules have been updated:${groupSettings!.rules}\n`
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
