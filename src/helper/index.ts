// Helper function to parse duration strings like "10m", "1h", etc.
export function parseDuration(durationStr: string): number | null {
  const match = durationStr.match(/^(\d+)([smhd])$/);

  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000; // Seconds
    case "m":
      return value * 60 * 1000; // Minutes
    case "h":
      return value * 60 * 60 * 1000; // Hours
    case "d":
      return value * 24 * 60 * 60 * 1000; // Days
    default:
      return null;
  }
}
