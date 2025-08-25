const oneDay = 60 * 60 * 24 * 1000;
export const oneSecond = 1000;

export function addOneDay(date: Date): Date {
  return new Date(date.getTime() + oneDay);
}

export function addSecondsToDate(date: Date, seconds: number): Date {
  return new Date(date.getTime() + oneSecond * seconds);
}
