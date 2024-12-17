import { Context } from 'grammy';
import { ServiceProvider } from '../../../service/database/ServiceProvider';

export class BlackListService {
  static async getAll(ctx: Context, groupId: number): Promise<string[]> {
    const service = ServiceProvider.getInstance();
    const groupService = await service.getGroupService();

    // Fetch group by group ID
    let group = await groupService.getByGroupId(groupId);

    // If group doesn't exist, initialize it
    if (!group) {
      group = await groupService.save(ctx);
    }

    return group.black_list || [];
  }
  static async add(groupId: number, word: string, ctx: Context): Promise<string[]> {
    const service = ServiceProvider.getInstance();
    const groupService = await service.getGroupService();
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx);
    }

    // Ensure the blacklist is initialized
    group.black_list = group.black_list || [];

    // Add the word if it's not already present
    if (!group.black_list.includes(word)) {
      group.black_list.push(word);
      await groupService.update({
        ...group,
        black_list: group.black_list,
      });
    }

    return group.black_list;
  }
  static async remove(groupId: number, ctx: Context, word?: string): Promise<string[]> {
    const service = ServiceProvider.getInstance();
    const groupService = await service.getGroupService();

    // Fetch group by group ID
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx);
    }
    if (!word) {
      if (group.black_list && group.black_list.length > 0) {
        group.black_list.pop();
      }
    } else {
      // Remove the specified word
      group.black_list = group.black_list.filter((item:string) => item !== word);
    }
    await groupService.update({
      ...group,
      black_list: group.black_list,
    });

    return group.black_list || [];
  }
  static async clear(groupId: number, ctx: Context): Promise<string[]> {
    const service = ServiceProvider.getInstance();
    const groupService = await service.getGroupService();
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx);
    }

    // Clear the blacklist
    group.black_list = [];
    await groupService.update({
      ...group,
      black_list: group.black_list,
    });

    return group.black_list;
  }
}
