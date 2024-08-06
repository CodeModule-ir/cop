import { DatabaseService } from "..";
import { GroupSettings } from "../../../entities/GroupSettings";

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
}
