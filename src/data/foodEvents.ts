import { BuildingId } from "./buildings";
import { FoodId } from "./foodCategories";

export type FoodEvent = {
  id: number;
  title: string;
  food: FoodId;
  building: BuildingId;
  startTime: string;
  endTime: string;
  host?: string;
  eventName?: string;
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
    startTime: "12:00 PM",
    endTime: "2:30 PM",
    host: "UES",
    eventName: "UES Meeting",
    description: "Free pizza at the UES meeting in ACEB room 110!",
  },
  {
    id: 2,
    title: "Donuts",
    food: "baked",
    building: "weldon",
    startTime: "1:00 PM",
    endTime: "4:00 PM",
    eventName: "Tech for Social Impact AGM",
    description: "The Tech for Social Impact student group is having their Annual General Meeting in the Weldon Library, and they have free donuts! Swing by to learn about the club and grab a snack :)",
  },
  {
    id: 3,
    title: "Coffee",
    food: "coffee",
    building: "ucc",
    startTime: "8:00 AM",
    endTime: "5:00 PM",
    host: "Health Sci Dream Team",
    eventName: "Health Sci Dream Team Information Session",
    description: "Learn more about the Health Sci Dream Team and their initiatives!",
  },
];