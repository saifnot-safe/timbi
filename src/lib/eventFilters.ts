import type { FoodEvent } from "@/types/FoodEvent";

export type DateFilter = "today" | "week" | "all";

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function matchesDateFilter(event: FoodEvent, dateFilter: DateFilter) {
  const today = getLocalDateString(new Date());

  if (dateFilter === "all") {
    return event.endDate >= today;
  }

  if (dateFilter === "today") {
    return event.startDate <= today && event.endDate >= today;
  }

  const weekFromNowDate = new Date();
  weekFromNowDate.setDate(weekFromNowDate.getDate() + 7);

  const weekFromNow = getLocalDateString(weekFromNowDate);

  return event.startDate <= weekFromNow && event.endDate >= today;
}