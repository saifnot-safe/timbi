"use client"

import TimbiHeader from "@/components/TimbiHeader";
import HeroSection from "@/components/HeroSection";
import type { FoodEvent } from "@/types/FoodEvent";
import dynamic from "next/dynamic"
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import EventsSection from "@/components/EventsSection";
import { matchesDateFilter } from "@/lib/eventFilters";

const TimbiMap = dynamic(() => import("@/components/TimbiMap"), {
  ssr: false,
})

export default function Home() {

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<FoodEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  useEffect(() => {
    loadEvents();
  }, []);

  const [dateFilter, setDateFilter] = useState<"today" | "week" | "all">("today");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [buildingFilter, setBuildingFilter] = useState<string[]>([]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (!matchesDateFilter(event, dateFilter)) return false;
      if (categoryFilter.length && !categoryFilter.includes(event.category)) return false;
      if (buildingFilter.length && !buildingFilter.includes(event.building)) return false;
      return true;
    });
  }, [events, dateFilter, categoryFilter, buildingFilter]);

  async function loadEvents() {
    setIsLoadingEvents(true);

    const { data, error } = await supabase
      .from("food_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setIsLoadingEvents(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const activeEvents = data.filter((event) => {
      if (!event.end_date) return false;
      return event.end_date >= today;
    });

    const formattedEvents: FoodEvent[] = activeEvents.map((event) => ({
      id: event.id,
      eventName: event.event_name,
      food: event.food,
      category: event.category,
      building: event.building,
      startDate: event.start_date,
      endDate: event.end_date,
      startTime: event.start_time,
      endTime: event.end_time,
      host: event.host,
      isContinuous: event.is_continuous,
      description: event.description,
      sourceUrl: event.source_url,
      reporter: event.reporter,
      isVerified: event.is_verified,
    }));

    setEvents(formattedEvents);
    setIsLoadingEvents(false);
  }

  function formatTime(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  }

  function formatDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    });
  }

  function formatEventDate(event: FoodEvent) {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);
    if (event.startDate === event.endDate) return startDate;
    return `${startDate} - ${endDate}`;
  }

  function formatEventTime(event: FoodEvent) {
    const startTime = event.startTime ? formatTime(event.startTime) : "Time TBD";
    const endTime = event.endTime ? formatTime(event.endTime) : null;
    if (!endTime) return `${startTime}`;
    if (event.isContinuous && event.startDate !== event.endDate) {
      return `${startTime} → ${formatDate(event.endDate)} ${endTime}`;
    }
    return `${startTime} - ${endTime}`;
  }

  function formatEventDateTimeCompact(event: FoodEvent) {
    const startDate = formatDate(event.startDate);
    const endDate = formatDate(event.endDate);
    if (event.startDate === event.endDate) return `${startDate}`;
    return `${startDate} - ${endDate}`;
  }

  return (
    <main className="min-h-screen bg-[#ffebd0]">

      <TimbiHeader />

      <HeroSection onEventCreated={loadEvents} />

      <FilterBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        buildingFilter={buildingFilter}
        onBuildingFilterChange={setBuildingFilter}
      />

      {isLoadingEvents ? null : events.length === 0 ? (
        <EmptyState onEventCreated={loadEvents} />
      ) : (
        <section id="events" className="scroll-mt-34 mx-auto max-w-6xl px-8 pb-30">

          {/* mobile-only list/map toggle */}
          <div className="mb-4 flex gap-2 lg:hidden">
            <button
              onClick={() => setMobileView("list")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                mobileView === "list"
                  ? "bg-[#FFA353] text-white"
                  : "border-2 border-[#FFA353] text-[#FFA353]"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                mobileView === "map"
                  ? "bg-[#FFA353] text-white"
                  : "border-2 border-[#FFA353] text-[#FFA353]"
              }`}
            >
              Map
            </button>
          </div>

          <div className="flex flex-col gap-8 lg:h-[600px] lg:flex-row">

            <div
              className={`lg:block lg:h-full lg:w-[380px] lg:shrink-0 ${
                mobileView === "list" ? "block" : "hidden"
              }`}
            >
              <EventsSection
                selectedEventId={selectedEventId}
                events={filteredEvents}
                onSelectEvent={setSelectedEventId}
                formatEventDate={formatEventDate}
                formatEventTime={formatEventTime}
                dateFilter={dateFilter}
              />
            </div>

            <div
              className={`lg:block lg:h-full lg:flex-1 ${
                mobileView === "map" ? "block" : "hidden"
              }`}
            >
              <TimbiMap
                events={filteredEvents}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
                formatEventDate={formatEventDate}
                formatEventTime={formatEventTime}
                formatEventDateTimeCompact={formatEventDateTimeCompact}
              />
            </div>

          </div>
        </section>
      )}

    </main>
  );
}