import { DatabaseService } from "..";
import { GroupMembership } from "../../../entities/GroupMembership";

export class GroupMembershipService extends DatabaseService {
  private groupMembershipRepo = this.getRepo(GroupMembership);

  async add(membership: GroupMembership) {
    return this.groupMembershipRepo.save(membership);
  }

  async getById(id: number) {
    return this.groupMembershipRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    return this.groupMembershipRepo.delete({ id });
  }
  async deleteUser(userId:number){
    return this.groupMembershipRepo.delete({ user: { id: userId } });
  }
}
