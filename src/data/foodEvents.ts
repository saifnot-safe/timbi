import { BuildingId } from "./buildings";
import { FoodId } from "./foodCategories";

export type FoodEvent = {
  id: number;
  title: string;
  food: FoodId;
  building: BuildingId;
  endTime: string;
  description?: string;
  reporter?: string;
  verified?: boolean;
};

export const foodEvents: FoodEvent[] = [
  {
    id: 1,
    title: "Pizza",
    food: "pizza",
    building: "aceb",
    endTime: "Ends at 2:30 PM",
  },
  {
    id: 2,
    title: "Donuts",
    food: "baked",
    building: "weldon",
    endTime: "Ends at 4:00 PM",
  },
  {
    id: 3,
    title: "Coffee",
    food: "coffee",
    building: "ucc",
    endTime: "Ends at 5:00 PM",
  },
];