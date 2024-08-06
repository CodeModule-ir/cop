import { Context } from "grammy";
import { SafeExecution } from "../../decorators/SafeExecution";

export class DateCommand {
  @SafeExecution()
  static async date(ctx: Context) {
    const now = new Date();

    // Format Gregorian Date
    const gregorianDate = this.formatGregorianDate(now);

    // Convert to Persian Date
    const persianDate = this.convertToPersianDate(now);

    // Reply with both date formats
    await ctx.reply(
      `Gregorian Date: **${gregorianDate}**\n
Persian Date: **${persianDate}**`,
      { parse_mode: "MarkdownV2" }
    );
  }

  static formatGregorianDate(date: Date): string {
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
    // Correct conversion using the Jalaali algorithm
    const persianDate = this.toJalaali(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );

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

    const dayName = persianDays[date.getDay()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayName} ${persianDate.jd} ${persianMonths[persianDate.jm - 1]} ${
      persianDate.jy
    } ساعت: ${hours}:${minutes}`;
  }

  static toJalaali(gy: number, gm: number, gd: number) {
    // Convert Gregorian to Jalaali using an algorithm
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

    const jm =
      days < 186
        ? 1 + Math.floor(days / 31)
        : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

    return { jy, jm, jd };
  }
}
