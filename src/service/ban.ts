import { Context } from "grammy";

export const banUser = async (userId: number, ctx: Context) => {
  try {
    await ctx.api.banChatMember(ctx.chat?.id!, userId);
    await ctx.reply(
      `User with ID ${userId} has been banned due to reaching 3 warnings.`
    );
  } catch (error) {
    console.error(`Failed to ban user with ID ${userId}:`, error);
  }
};
