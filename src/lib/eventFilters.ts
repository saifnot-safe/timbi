import type { FoodEvent } from "@/types/FoodEvent";
import { getLocalDateKey } from "./dateUtils";

export type DateFilter = "today" | "week" | "all";


export function matchesDateFilter(event: FoodEvent, dateFilter: DateFilter) {
  const today = getLocalDateKey();

  if (dateFilter === "all") {
    return event.endDate >= today;
  }

  if (dateFilter === "today") {
    return event.startDate <= today && event.endDate >= today;
  }

  const weekFromNowDate = new Date();
  weekFromNowDate.setDate(weekFromNowDate.getDate() + 7);

  const weekFromNow = getLocalDateKey(weekFromNowDate);

  return event.startDate <= weekFromNow && event.endDate >= today;
}