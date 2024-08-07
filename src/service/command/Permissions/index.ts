import { ChatPermissions } from "grammy/types";
import { GroupSettingsService } from "../../db/group/index";
import { Context } from "grammy";
/**
 * Class to manage chat permissions.
 * Represents permissions that can be set for a chat.
 */
export class Permissions {
  private permissions: ChatPermissions;
  private group: GroupSettingsService;
  private id: number;
  static APPROVED_USER(status: boolean = true) {
    return {
      can_pin_messages: status,
      can_send_other_messages: status,
      can_send_polls: status,
      can_send_messages: status,
      can_send_photos: status,
    };
  }
  static DEFAULT = {
    can_send_messages: true,
    can_send_other_messages: true,
    can_invite_users: true,
  };
  constructor(permissions: ChatPermissions, id: number) {
    this.permissions = permissions;
    this.id = id;
    this.group = new GroupSettingsService();
  }

  /**
   * Update permissions and save to database.
   * @param newPermissions - The new permissions to apply.
   */
  private async update(
    newPermissions: Partial<ChatPermissions>
  ): Promise<void> {
    this.permissions = { ...this.permissions, ...newPermissions };
    await this.save();
  }

  /**
   * Save the updated permissions to the database.
   */
  private async save(): Promise<void> {
    const groupSettings = await this.group.getByGroupId(this.id);
    if (groupSettings) {
      groupSettings.chat_permissions = this.permissions;
      await this.group.save(groupSettings);
    }
  }

  /**
   * Get current permissions.
   */
  public async get(): Promise<ChatPermissions | undefined> {
    const group = await this.group.getByGroupId(this.id);
    return group?.chat_permissions;
  }

  /**
   * Lock all permissions by setting them to false.
   */
  public async lock() {
    await this.update({
      can_send_messages: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_send_photos: false,
      can_send_documents: false,
      can_manage_topics: false,
      can_send_audios: false,
      can_send_video_notes: false,
      can_send_videos: false,
      can_send_voice_notes: false,
    });
  }

  /**
   * Unlock all permissions by setting them to true.
   */
  public async unlock() {
    await this.update({
      can_send_messages: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: true,
      can_invite_users: true,
      can_pin_messages: true,
      can_send_photos: true,
      can_send_documents: true,
      can_manage_topics: true,
      can_send_audios: true,
      can_send_video_notes: true,
      can_send_videos: true,
      can_send_voice_notes: true,
    });
  }

  /**
   * Lock sending GIFs.
   */
  public async lockGifs() {
    await this.update({
      can_send_video_notes: false,
      can_send_other_messages: false,
      can_send_videos: false,
    });
  }

  /**
   * Unlock sending GIFs.
   */
  public async unlockGifs() {
    await this.update({
      can_send_video_notes: true,
      can_send_other_messages: false,
      can_send_videos: true,
    });
  }

  /**
   * Lock sending polls.
   */
  public async lockPolls() {
    await this.update({
      can_send_polls: false,
    });
  }

  /**
   * Unlock sending polls.
   */
  public async unlockPolls() {
    await this.update({
      can_send_polls: true,
    });
  }

  static async modify(ctx: Context, action: "lock" | "unlock", type?: string) {
    const chatId = ctx.chat?.id!;
    const permissionsConfig = (await ctx.api.getChat(chatId))!.permissions;
    const permissions = new Permissions(permissionsConfig!, ctx.chat!.id);

    if (!type) {
      action === "lock" ? permissions.lock() : permissions.unlock();
      await ctx.reply(
        `${
          action === "lock" ? "Locked" : "Unlocked"
        } all permissions for all members.`
      );
    } else {
      switch (type.toLowerCase()) {
        case "gif":
          action === "lock" ? permissions.lockGifs() : permissions.unlockGifs();
          break;
        case "poll":
          action === "lock"
            ? permissions.lockPolls()
            : permissions.unlockPolls();
          break;
        default:
          return ctx.reply(
            `Invalid ${action} type. Available options are: gif, poll.`
          );
      }
      await ctx.reply(
        `${action === "lock" ? "Locked" : "Unlocked"} ${type} for all members.`
      );
    }

    const newPermissions = await permissions.get();
    await ctx.api.setChatPermissions(chatId, newPermissions!);
  }
}
