import { Context } from "grammy";
import { DatabaseService } from "..";
import { GroupSettings } from "../../../entities/GroupSettings";
import * as BlackListJson from "../../../helper/black_list.json";

export class GroupSettingsService extends DatabaseService {
  private groupSettingsRepo = this.getRepo(GroupSettings);

  async create(settings: Partial<GroupSettings>): Promise<GroupSettings> {
    return this.groupSettingsRepo.create(settings);
  }

  async getByGroupId(groupId: number): Promise<GroupSettings | null> {
    return this.groupSettingsRepo.findOne({ where: { group_id: groupId } });
  }

  async save(settings: GroupSettings) {
    return this.groupSettingsRepo.save(settings);
  }

  async remove(id: number) {
    return this.groupSettingsRepo.delete({ id });
  }
  async init(ctx: Context) {
    const chat = ctx.chat!;
    const from = ctx.from;
    const bl = BlackListJson.map((item: { term: string }) =>
      item.term.toLowerCase()
    );
    const group = await this.create({
      group_id: chat.id,
      group_name: chat.title,
      welcome_message: "",
      chat_permissions: (await ctx.api.getChat(chat.id)).permissions,
      rules: "",
      description: "",
      black_list: bl,
      added_by_id: from?.id,
      approvedUsers: [],
      members: [],
    });
    return await this.groupSettingsRepo.save(group);
  }
}
