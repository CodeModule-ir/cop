import { Context } from 'grammy';
import { startCommand, helpCommand } from '../service/commandService';
import { listAdmins } from '../api/roles';
export class Command{
  static async start(ctx:Context){
    await startCommand(ctx)
  }
  static async help(ctx:Context){
    await helpCommand(ctx)
  }
  static async admins(ctx:Context){
    await listAdmins(ctx)
  }
}