"use client";

import FoodCard from "./FoodCard";
import type { FoodEvent } from "@/types/FoodEvent";
import { buildings } from "@/data/buildings";
import Image from "next/image";

type EventsSectionProps = {
  onSelectEvent: (eventId: number | null) => void;
  events: FoodEvent[];
  selectedEventId: number | null;
  formatEventDate: (event: FoodEvent) => string;
  formatEventTime: (event: FoodEvent) => string;
  dateFilter: "today" | "week" | "all";
};


export default function EventsSection({
  onSelectEvent,
  events,
  selectedEventId,
  formatEventDate,
  formatEventTime,
  dateFilter,
}: EventsSectionProps) {
  return (
<section className="flex min-h-0 flex-col">

      {events.length === 0 ? (
  <div className="flex flex-col items-center px-2 pt-6 text-center">
    <Image
      src="/timbi/sad-timbi.png"
      alt="Sad Timbi"
      width={140}
      height={140}
    />
    <p className="mt-4 text-[#8c6a52]">
      Timbi couldn't find any events! <br />
      Try using different filters or check back later.
    </p>
  </div>
) : (
  <div className="timbi-scroll flex flex-col  h-[500px] gap-4 overflow-y-auto px-2 pt-3 pb-4">
    {events.map((event) => (
      <FoodCard
        key={event.id}
        event={event.eventName || "Unnamed Event"}
        food={event.food}
        location={buildings[event.building].shortName}
        date={formatEventDate(event)}
        time={formatEventTime(event)}
        isSelected={selectedEventId === event.id}
        onClick={() => onSelectEvent(event.id)}
      />
    ))}
  </div>
)}
    </section>
  );
}