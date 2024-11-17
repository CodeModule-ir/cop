import { PoolClient } from 'pg';
import { GroupRule } from '../../types/database/TablesTypes';
import { ServiceProvider } from '../../service/database/ServiceProvider';
import { Context } from 'grammy';
import { DatabaseService } from '../service/Databas';

export class GroupRuleService {
  private _db: DatabaseService;

  constructor(private _client: PoolClient) {
    this._db = new DatabaseService(this._client);
  }
  private async createRule(groupRule: Omit<GroupRule, 'id'>): Promise<GroupRule> {
    return await this._db.insert<GroupRule>('GroupRule', {
      group_id: groupRule.group_id,
      rule_text: groupRule.rule_text,
      added_at: groupRule.added_at || new Date(),
      added_by: groupRule.added_by,
    });
  }
  private async update(ruleId: number, newRuleText: string[]): Promise<GroupRule> {
    const result = await this._db.update<GroupRule>('GroupRule', { rule_text: newRuleText, added_at: new Date() }, { id: ruleId });
    return result;
  }
  /**
   * Fetches all rules for a specific group, sorted by added date (most recent first).
   */
  async getRulesByGroupId(groupId: number): Promise<GroupRule[]> {
    const services = ServiceProvider.getInstance();
    const groupService = await services.getGroupService();
    let group = await groupService.getByGroupId(groupId);
    const result = await this._db.query<GroupRule>('SELECT id, group_id, rule_text, added_at, added_by FROM "GroupRule" WHERE group_id = $1 ORDER BY added_at DESC;', [group?.id!]);
    return result.rows;
  }
  /**
   * Adds a new rule to a group.
   */
  async addGroupRule(ctx: Context, ruleText: string): Promise<GroupRule> {
    const chat = ctx.chat!;
    const groupId = chat.id;
    const userId = ctx.from?.id!;

    const services = ServiceProvider.getInstance();
    const [groupService, userService] = await Promise.all([services.getGroupService(), services.getUserService()]);
    // Ensure the group exists in the database
    let group = await groupService.getByGroupId(groupId);
    if (!group) {
      group = await groupService.save(ctx); // Create group if not found
    }
    // Ensure the user exists in the database
    let user = await userService.getByTelegramId(userId);
    if (!user) {
      const userData = { first_name: ctx.from?.first_name!, id: userId, username: ctx.from?.username! };
      user = await userService.save(userData); // Create user if not found
    }
    // Check if there's an existing rule for this group
    const groupRules = await this.getRulesByGroupId(groupId);
    if (groupRules.length > 0) {
      // Update the existing rule's text array by appending the new rule
      const existingRule = groupRules[0]; // Assuming only one entry per group
      const updatedRuleText = [...existingRule.rule_text, ruleText];

      return this.update(existingRule.id, updatedRuleText);
    } else {
      // Create a new rule entry if no rules exist
      return this.createRule({
        group_id: group.id,
        rule_text: [ruleText],
        added_at: new Date(),
        added_by: user.id,
      });
    }
    // Create the new group rule
  }
  /**
   * Deletes the most recently added rule for a group.
   */
  async deleteLastGroupRule(ctx: Context): Promise<GroupRule | null> {
    const chat = ctx.chat!;
    const groupId = chat.id;
    const groupRules = await this.getRulesByGroupId(groupId);
    if (groupRules.length === 0) {
      // No rules to delete
      return null;
    }
    const latestRule = groupRules[0];
    const updatedRuleText = latestRule.rule_text.slice(0, -1);
    if (updatedRuleText.length === 0) {
      const result = await this._db.delete<GroupRule>('GroupRule', { id: latestRule.id });
      return result[0] || null;
    } else {
      // Update the rule_text array with the last element removed
      const result = await this._db.update<GroupRule>('GroupRule', { rule_text: updatedRuleText, added_at: new Date() }, { id: latestRule.id });
      return result;
    }
  }

  /**
   * Deletes all rules for a specific group.
   */
  async clearAllRulesForGroup(ctx: Context): Promise<void> {
    const chat = ctx.chat!;
    const groupId = chat.id;

    const groupRules = await this.getRulesByGroupId(groupId);
    if (groupRules.length === 0) {
      console.log(`No rules found for group ID: ${groupId}.`);
      return;
    }
    await this._db.delete<GroupRule>('GroupRule', { group_id: groupRules[0].group_id });
  }
}
