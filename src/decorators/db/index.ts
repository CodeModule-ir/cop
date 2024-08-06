import { Context } from "grammy";
import { GroupSettingsService } from "../../service/db/group";
export function initGroupSetting() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const ctx: Context = (this as any)?.ctx || args[0];
      const groupSettingsRepo = new GroupSettingsService();
      const groupSettings = await groupSettingsRepo.getByGroupId(ctx.chat?.id!);
      if (!groupSettings) {
        await groupSettingsRepo.init(ctx);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}