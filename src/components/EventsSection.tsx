"use client";

import FoodCard from "./FoodCard";
import type { FoodEvent } from "@/types/FoodEvent";
import { buildings } from "@/data/buildings";

type EventsSectionProps = {
  onSelectEvent: (eventId: number | null) => void;
  events: FoodEvent[];
  selectedEventId: number | null;
  formatEventDate: (event: FoodEvent) => string;
  formatEventTime: (event: FoodEvent) => string;
  dateFilter: "today" | "week" | "all";
};

const sectionTitles = {
  today: "Today's Finds",
  week: "This Week",
  all: "Upcoming Events",
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
    <section className="flex h-full flex-col">
      <h2 className="px-2 mb-4 text-3xl font-bold text-[#DA7625]">
        {sectionTitles[dateFilter]}
      </h2>

      {events.length === 0 ? (
        <p className="px-2 text-[#8c6a52]">No events match your filters.</p>
      ) : (
      <div className="flex flex-col gap-4 overflow-y-auto px-2 pt-3 pb-4 [scrollbar-width:thin]">
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