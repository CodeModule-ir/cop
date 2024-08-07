import { Repository } from "typeorm";
import { SafeExecution } from "../../decorators/SafeExecution";
import { GroupSettings } from "../../entities/GroupSettings";
import * as BlackListJson from "../../helper/black_list.json";
import { Context } from "grammy";
import { GroupSettingsService } from "../db/group";
import { initGroupSetting } from "../../decorators/db";

export class BlacklistService {
  private static GroupSettings = new GroupSettingsService();
  // Store JSON terms into the database
  @SafeExecution()
  @initGroupSetting()
  static async storeBlacklistTerms(groupSettings: GroupSettings) {
    const newTerms = BlackListJson.map((item: { term: string }) =>
      item.term.toLowerCase()
    );

    const existingBlacklist = groupSettings.black_list || [];

    // Add only new terms
    const updatedBlacklist = [...new Set([...existingBlacklist, ...newTerms])];

    groupSettings.black_list = updatedBlacklist;
    await BlacklistService.GroupSettings.save(groupSettings);
    return updatedBlacklist;
  }

  // Display the blacklist in a formatted manner
  @SafeExecution()
  @initGroupSetting()
  static async BlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }
    const repo = BlacklistService.GroupSettings;
    const groupSettings = await repo.getByGroupId(groupId!);

    if (!groupSettings!.black_list || groupSettings!.black_list.length === 0) {
      // Initialize blacklist from BlackListJson and save
      await this.storeBlacklistTerms(groupSettings!);
    }

    // Format the blacklist nicely
    const formattedList = groupSettings!.black_list
      .map((term, index) => `${index + 1}. ${term}`)
      .join("\n");

    return ctx.reply(`Current Blacklist:\n${formattedList}`);
  }

  // Add new term to the blacklist
  @SafeExecution()
  @initGroupSetting()
  static async addBlackList(ctx: Context) {
    const groupId = ctx.chat?.id;
    if (!groupId) {
      return ctx.reply("Could not retrieve chat information.");
    }

    const blacklistInput = String(ctx.match);
    if (!blacklistInput) {
      return ctx.reply("Please provide a term to add to the blacklist.");
    }

    const repo = BlacklistService.GroupSettings;
    const groupSettings = await repo.getByGroupId(groupId);
    const blacklist = groupSettings!.black_list || [];
    if (blacklist.includes(blacklistInput.toLowerCase())) {
      return ctx.reply(`"${blacklistInput}" is already in the blacklist.`);
    }

    blacklist.push(blacklistInput.toLowerCase());
    groupSettings!.black_list = blacklist;
    await repo.save(groupSettings!);

    return ctx.reply(`"${blacklistInput}" has been added to the blacklist.`);
  }

  @SafeExecution()
  @initGroupSetting()
  static async remove(ctx: Context) {
    const groupId = ctx.chat?.id!;
    const termToRemove = String(ctx.match);
    const repo = BlacklistService.GroupSettings;
    const groupSettings = await repo.getByGroupId(groupId);
    if (!groupSettings || !groupSettings.black_list) {
      return ctx.reply("The blacklist is currently empty.");
    }
    const blacklist = groupSettings.black_list;
    const termIndex = blacklist.indexOf(termToRemove.toLowerCase());

    if (termIndex === -1) {
      return ctx.reply("The desired word is not in the blacklist.");
    }

    // Remove the term
    blacklist.splice(termIndex, 1);
    groupSettings.black_list = blacklist;
    await repo.save(groupSettings);

    return ctx.reply("The desired word was removed from the blacklist");
  }
}