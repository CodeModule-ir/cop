import { DatabaseService } from "..";
import { ApprovedUser } from "../../../entities/ApprovedUser";
import { GroupSettings } from "../../../entities/GroupSettings";

export class ApprovedUserService extends DatabaseService {
  private approvedUserRepo = this.getRepo(ApprovedUser);
  async create(userData: Partial<ApprovedUser>): Promise<ApprovedUser> {
    return this.approvedUserRepo.create(userData);
  }
  async save(user: ApprovedUser): Promise<ApprovedUser> {
    return this.approvedUserRepo.save(user);
  }

  async getById(id: number): Promise<ApprovedUser | null> {
    return this.approvedUserRepo.findOne({ where: { id } });
  }
  async getByIdAndGroup(userId: number,groupSettings:GroupSettings) {
    return this.approvedUserRepo.findOne({
      where: { user_id: userId, group: groupSettings },
    });
  }
  async remove(id: number): Promise<void> {
    await this.approvedUserRepo.delete({ id });
  }
}
