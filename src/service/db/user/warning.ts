import { DatabaseService } from "..";
import { User } from "../../../entities/User";
import { Warning } from "../../../entities/Warning";

export class WarningServiceDb extends DatabaseService {
  private warningRepo = this.getRepo(Warning);

  async create(warning: Partial<Warning>): Promise<Warning> {
    const newWarning = this.warningRepo.create(warning);
    return this.warningRepo.save(newWarning);
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

  async clear(userId: number) {
    return this.warningRepo.delete({ user: { id: userId } });
  }

  async count(user: User) {
    return await this.warningRepo.count({ where: { user } });
  }
}
