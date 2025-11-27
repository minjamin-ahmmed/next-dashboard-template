import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function matchesDateFilter(
  date: Date | string | null,
  filterValue: string
) {
  if (!date) return false;

  const parsedDate = typeof date === "string" ? new Date(date) : date;

  switch (filterValue) {
    case "today":
      return isToday(parsedDate);
    case "thisWeek":
      return isThisWeek(parsedDate);
    case "thisMonth":
      return isThisMonth(parsedDate);
    case "thisYear":
      return isThisYear(parsedDate);
    default:
      return true;
  }
}

export const dateFilterFn = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId);
  if (!value) return false;
  return matchesDateFilter(new Date(value), filterValue);
};


