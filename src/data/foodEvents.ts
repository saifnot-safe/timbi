import { BuildingId } from "./buildings";
import { FoodCategory } from "./foodCategories";

export type FoodEvent = {
  id: number;
  eventName: string;
  food: string;
  category: FoodCategory;
  building: BuildingId;
  startTime: string;
  endTime: string;
  host?: string;
  description?: string;
  sourceUrl?: string;
  reporter?: string;
  verified?: boolean;
};

export const foodEvents: FoodEvent[] = [
  {
  id: 1,
  eventName: "UES Meeting",
  food: "pizza",
  category: "pizza",
  building: "aceb",
  startTime: "12:00 PM",
  endTime: "2:30 PM",
  host: "UES",
  description: "Free pizza at the UES meeting",
  sourceUrl: "https://www.instagram.com/p/CnXo3a7tHj-/",
  },
  {
    id: 2,
    eventName: "Tech for Social Impact AGM",
    food: "donuts",
    category: "baked",
    building: "weldon",
    startTime: "1:00 PM",
    endTime: "4:00 PM",
    description: "The Tech for Social Impact student group is having their Annual General Meeting in the Weldon Library, and they have free donuts! Swing by to learn about the club and grab a snack :)",
    sourceUrl: "https://www.instagram.com/p/CnXo3a7tHj-/",
  },
  {
    id: 3,
    eventName: "Health Sci Dream Team Information Session",
    food: "coffee",
    category: "coffee",
    building: "ucc",
    startTime: "8:00 AM",
    endTime: "5:00 PM",
    host: "Health Sci Dream Team",
    description: "Learn more about the Health Sci Dream Team and their initiatives!",
    sourceUrl: "https://www.instagram.com/p/CnXo3a7tHj-/",
  },
];