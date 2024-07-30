import { Context } from 'grammy';

export async function isBotAdmin(ctx: Context) {
  const botInfo = await ctx.getChatMember(ctx.me.id);
  console.log('botInfo:', botInfo);
  return ['administrator', 'creator'].includes(botInfo.status);
}

export async function isUserAdmin(ctx: Context, userId: number) {
  const memberInfo = await ctx.getChatMember(userId);
  console.log('memberInfo:', memberInfo);
  return ['administrator', 'creator'].includes(memberInfo.status);
}