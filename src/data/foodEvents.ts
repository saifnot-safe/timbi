
export type FoodEvent = {
  id: number;
  title: string;
  location: string;
  endTime: string;
  description?: string;
  reporter?: string;
  verified?: boolean;
};

export const foodEvents: FoodEvent[] = [
  {
    id: 1,
    title: "Pizza",
    location: "Engineering Atrium",
    endTime: "Ends at 2:30 PM",
  },
  {
    id: 2,
    title: "Donuts",
    location: "Weldon Library",
    endTime: "Ends at 4:00 PM",
  },
  {
    id: 3,
    title: "Coffee",
    location: "UCC",
    endTime: "Ends at 5:00 PM",
  },
];