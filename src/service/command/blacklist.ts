import { Repository } from "typeorm";
import { SafeExecution } from "../../decorators/SafeExecution";
import { GroupSettings } from "../../entities/GroupSettings";
import { AppDataSource } from "../../config/db";
import * as BlackListJson from "../../helper/black_list.json";
import { Context } from "grammy";
export class BlacklistService {
  // Store JSON terms into the database
  @SafeExecution()
  static async storeBlacklistTerms() {
    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);

    // Process each term in the JSON
    const newTerms = BlackListJson.map((item: { term: string }) =>
      item.term.toLowerCase()
    );

    for (const groupSettings of await groupRepo.find()) {
      const existingBlacklist = groupSettings.black_list || [];

      // Add only new terms
      const updatedBlacklist = [
        ...new Set([...existingBlacklist, ...newTerms]),
      ];
      groupSettings.black_list = updatedBlacklist;
      await groupRepo.save(groupSettings);
    }
  }

  // Display the blacklist in a formatted manner
  @SafeExecution()
  static async BlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);
    const groupSettings = await groupRepo.findOne({
      where: { group_id: groupId },
    });

    if (
      !groupSettings ||
      !groupSettings.black_list ||
      groupSettings.black_list.length === 0
    ) {
      return ctx.reply("The blacklist is currently empty.");
    }

    // Format the blacklist nicely
    const formattedList = groupSettings.black_list
      .map((term, index) => `${index + 1}. ${term}`)
      .join("\n");
    return ctx.reply(`Current Blacklist:\n${formattedList}`);
  }

  // Add new term to the blacklist
  @SafeExecution()
  static async addBlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const blacklistInput = ctx.message?.text?.split(" ")[1];
    if (!blacklistInput) {
      return ctx.reply("Please provide a term to add to the blacklist.");
    }

    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);
    let groupSettings = await groupRepo.findOne({
      where: { group_id: groupId },
    });

    if (!groupSettings) {
      groupSettings = groupRepo.create({
        group_id: groupId,
        group_name: ctx.chat?.title || "",
        black_list: [],
        rules: "",
        description: "",
        welcome_message: "",
      });
    }

    const blacklist = groupSettings.black_list || [];
    if (blacklist.includes(blacklistInput.toLowerCase())) {
      return ctx.reply(`"${blacklistInput}" is already in the blacklist.`);
    }

    blacklist.push(blacklistInput.toLowerCase());
    groupSettings.black_list = blacklist;
    await groupRepo.save(groupSettings);

    return ctx.reply(`"${blacklistInput}" has been added to the blacklist.`);
  }

  @SafeExecution()
  static async remove(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const termToRemove = ctx.message?.text?.split(" ")[1];
    if (!termToRemove) {
      return ctx.reply("Please provide a term to remove from the blacklist.");
    }

    const groupRepo: Repository<GroupSettings> =
      AppDataSource.getRepository(GroupSettings);
    const groupSettings = await groupRepo.findOne({
      where: { group_id: groupId },
    });

    if (!groupSettings || !groupSettings.black_list) {
      return ctx.reply("The blacklist is currently empty.");
    }

    const blacklist = groupSettings.black_list;
    const termIndex = blacklist.indexOf(termToRemove.toLowerCase());

    if (termIndex === -1) {
      return ctx.reply("The desired word is not in the black list.");
    }

    // Remove the term
    blacklist.splice(termIndex, 1);
    groupSettings.black_list = blacklist;
    await groupRepo.save(groupSettings);

    return ctx.reply("The desired word was removed from the blacklist");
  }
}
