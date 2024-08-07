import { Context } from "grammy";
import { SafeExecution } from "../../decorators/SafeExecution";
import { Logger } from "../../config/logger";
const logger = new Logger({
  file: "date-command.log",
  level: "info",
  timestampFormat: "locale",
  jsonFormat: true,
});

export class DateCommand {
  @SafeExecution()
  static async date(ctx: Context) {
    logger.info("Date command invoked.", "Date", {
      chatId: ctx.chat?.id!,
      userId: ctx.from?.id!,
    });

    const now = new Date();

    // Format Gregorian Date
    const gregorianDate = this.formatGregorianDate(now);
    logger.info("Gregorian date formatted.", "Date", { gregorianDate });

    // Convert to Persian Date
    const persianDate = this.convertToPersianDate(now);
    logger.info("Persian date converted.", "Date", { persianDate });

    // Reply with both date formats
    await ctx.reply(
      `Gregorian Date: **${gregorianDate}**\n
Persian Date: **${persianDate}**`,
      { parse_mode: "MarkdownV2" }
    );
  }

  static formatGregorianDate(date: Date): string {
    logger.debug("Formatting Gregorian date.", "Date", { date });

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayName}, ${monthName} ${day}, ${year}, time: ${hours}:${minutes}`;
  }

  static convertToPersianDate(date: Date): string {
    // Gy: Gregorian year
    // Gm: Gregorian month (1-12)
    // Gd: Gregorian day of the month (1-31)

    logger.debug("Converting to Persian date.", "Date", { date });
    const persianDate = this.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    logger.debug("Persian date calculated.", "Date", { persianDate });

    const persianDays = [
      "شنبه",
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
    ];

    const persianMonths = [
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];

    const dayName = persianDays[date.getDay()+1];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    
    return `${dayName} ${persianDate.jd} ${persianMonths[persianDate.jm - 1]} ${ persianDate.jy } ساعت: ${hours}:${minutes}`;
  }

  static toJalaali(gy: number, gm: number, gd: number) {
    logger.debug("Converting Gregorian date to Jalaali.", "Date", {
      gy,
      gm,
      gd,
    });

    const g_d_m = [
      0,
      31,
      (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];
    let gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      355666 +
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) +
      gd;

    for (let i = 0; i < gm; ++i) days += g_d_m[i];

    let jy = -1595 + 33 * Math.floor(days / 12053);
    days %= 12053;

    jy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

     // Month Calculation
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);

    // Day Calculation
    const jd = (days < 186) ? (days % 31) : ((days - 186) % 30);

    console.log("jm", jm);
    console.log("jd", jd);

    logger.debug("Jalaali date converted.", "Date", {
      jy,
      jm,
      jd,
    });
    return { jy, jm, jd };
  }
}
