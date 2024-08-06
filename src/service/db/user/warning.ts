import { DatabaseService } from "..";
import { User } from "../../../entities/User";
import { Warning } from "../../../entities/Warning";

export class WarningServiceDb extends DatabaseService {
  private warningRepo = this.getRepo(Warning);
  async create(warning: Partial<Warning>): Promise<Warning> {
    return this.warningRepo.create(warning);
  }
  async save(warning: Warning) {
    return this.warningRepo.save(warning);
  }

  async getByUserId(userId: number) {
    return this.warningRepo.find({ where: { user: { id: userId } } });
  }
  async remove(id: number) {
    return this.warningRepo.delete({ id });
  }
  async clear(user: any) {
    return this.warningRepo.delete({ user });
  }

  async count(user: User) {
    return await this.warningRepo.count({ where: { user } });
  }
}
