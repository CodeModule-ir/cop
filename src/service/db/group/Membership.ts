import { DatabaseService } from "..";
import { GroupMembership } from "../../../entities/GroupMembership";

export class GroupMembershipService extends DatabaseService {
  private groupMembershipRepo = this.getRepo(GroupMembership);

  async create(membership: Partial<GroupMembership>): Promise<GroupMembership> {
    return this.groupMembershipRepo.create(membership);
  }

  async getById(id: number) {
    return this.groupMembershipRepo.findOne({ where: { id } });
  }

  async getGroupAndUserId(groupId: number, userId: number) {
    return this.groupMembershipRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
  }
  async save(membership: Partial<GroupMembership>): Promise<GroupMembership> {
    return this.groupMembershipRepo.save(membership);
  }
  async remove(id: number) {
    return this.groupMembershipRepo.delete({ id });
  }
  async deleteUser(userId: number) {
    return this.groupMembershipRepo.delete({ user: { id: userId } });
  }
}
