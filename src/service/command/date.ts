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
      `Gregorian Date: **${gregorianDate}**\nPersian Date: **${persianDate}**`,
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
    // Basic Persian calendar conversion logic
    // Note: This implementation is a simplified version.
    const persianDays = [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
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

    const dayOfMonth = this.getPersianDayOfMonth(date);
    const month = this.getPersianMonth(date);
    const year = this.getYear(date);
    const dayName = persianDays[date.getDay()];
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${dayName} ${dayOfMonth} ${persianMonths[month]} ${year} ساعت: ${hours}:${minutes}`;
  }

  // Determine the Persian day of the month
  static getPersianDayOfMonth(date: Date): number {
    const startOfPersianYear = this.getStartOfPersianYear(date.getFullYear());
    const dayOfYear =
      Math.floor(
        (date.getTime() - startOfPersianYear.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    return dayOfYear % this.getDaysInPersianMonth(date);
  }

  // Determine the Persian month
  static getPersianMonth(date: Date): number {
    const dayOfYear =
      Math.floor(
        (date.getTime() -
          this.getStartOfPersianYear(date.getFullYear()).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;
    const monthsLengths = this.getPersianMonthLengths(date.getFullYear());
    let month = 0;
    let daysPassed = 0;
    for (let i = 0; i < monthsLengths.length; i++) {
      daysPassed += monthsLengths[i];
      if (dayOfYear <= daysPassed) {
        month = i;
        break;
      }
    }
    return month;
  }

  // Determine the Persian year
  static getYear(date: Date): number {
    return date.getFullYear();
  }

  // Get the starting date of the Persian year
  static getStartOfPersianYear(year: number): Date {
    return new Date(year, 2, 20); 
  }

  // Get lengths of months in Persian year
  static getPersianMonthLengths(year: number): number[] {
    return [31, 30, 30, 31, 31, 30, 31, 31, 30, 30, 30, 29]; // Last month may have 29 or 30 days
  }
  // Get the number of days in the current Persian month
  static getDaysInPersianMonth(date: Date): number {
    return this.getPersianMonthLengths(this.getYear(date))[
      this.getPersianMonth(date)
    ];
  }
}
