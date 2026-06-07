import { FoodCategory } from "@/data/foodCategories"; 
import { BuildingId } from "@/data/buildings";

export type FoodEvent = {
  id: number;
  eventName: string;
  food: string;
  category: FoodCategory;
  building: BuildingId;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  host: string;
  description?: string;
  sourceUrl: string;
  reporter?: string;
  verified?: boolean;
};