// Kept separate so weekly archive date math can be unit-tested without browser storage.
export function mondayForOffset(now: Date, weeksAgo: number): Date {
  const monday = new Date(now);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) - Math.max(0, weeksAgo) * 7);
  return monday;
}

export function localISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
