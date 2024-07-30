import { Context } from 'grammy';
import { warnUserCommand} from '../admin-tools/moderation';

export class ManagementGroup{
  static async warn(ctx:Context){
    await warnUserCommand(ctx);
  }
  // static async mute(ctx:Context){
  //   await muteUser(ctx);
  // }
  // static async ban(ctx:Context){
  //   await banUser(ctx);
  // }
}