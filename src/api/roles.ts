import { Context } from 'grammy';
export async function listAdmins(ctx: Context) {
  const administrators = await ctx.getChatAdministrators();
  console.log('administrators:',administrators);
  const adminList = administrators.map(admin => {
    const role = admin.status === 'creator' ? 'Owner' : 'Admin';
    return `${role}: ${admin.user.first_name} (@${admin.user.username})`;
  }).join('\n');
  await ctx.reply(`Admins in this chat:\n${adminList}`,{reply_parameters:{
    message_id:ctx.message?.message_id!
  },});
}
