"use client"

import TimbiHeader from "@/components/TimbiHeader";
import FoodCard from "@/components/FoodCard";
import HeroSection from "@/components/HeroSection";
import TodaysFoodSection from "@/components/TodaysFoodSection";
import type { FoodEvent } from "@/types/FoodEvent";
import dynamic from "next/dynamic"
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import EmptyState from "@/components/EmptyState";

const TimbiMap = dynamic(() => import("@/components/TimbiMap"), {
  ssr: false,
})




export default function Home() {


  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<FoodEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
  loadEvents();

  const interval = setInterval(() => {
    loadEvents();
  }, 60_000);

  return () => clearInterval(interval);
}, []);



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
  const now = new Date();

  const activeEvents = data.filter((event) => {
    const eventEnd = new Date(`${event.end_date}T${event.end_time}`);
    return eventEnd >= now;
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
    verified: event.verified,
  }));

 setEvents(formattedEvents);
 setIsLoadingEvents(false);
}



function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHour}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function formatEventDate(event: FoodEvent) {
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);

  if (event.startDate === event.endDate) {
    return startDate;
  }

  return `${startDate} - ${endDate}`;
}

function formatEventTime(event: FoodEvent) {
  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);

  if (event.isContinuous && event.startDate !== event.endDate) {
    return `${startTime} → ${formatDate(event.endDate)} ${endTime}`;
  }

  return `${startTime} - ${endTime}`;
}

function formatEventDateTimeCompact(event: FoodEvent) {
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);
  const startTime = formatTime(event.startTime);
  const endTime = formatTime(event.endTime);

  if (event.startDate === event.endDate) {
    return `${startDate}`;
  }

  return `${startDate} - ${endDate}`;
}


  
  return (
        <main className="min-h-screen bg-[#ffebd0]">

          {/*<p className="p-4 text-black">
            events loaded: {events.length}
          </p>*/}

        <TimbiHeader />

        <HeroSection onEventCreated={loadEvents}/>

       {isLoadingEvents ? null : events.length === 0 ? (
  <EmptyState onEventCreated={loadEvents} />
) : (
  <>
  <TodaysFoodSection
  selectedEventId={selectedEventId}
  events={events}
  onSelectEvent={setSelectedEventId}
  formatEventDate={formatEventDate}
  formatEventTime={formatEventTime}
/>

    <section id="campus-map" className="mx-auto max-w-6xl px-8 pb-30">
      <TimbiMap
  events={events}
  selectedEventId={selectedEventId}
  onSelectEvent={setSelectedEventId}
  formatEventDate={formatEventDate}
  formatEventTime={formatEventTime}
  formatEventDateTimeCompact={formatEventDateTimeCompact}
/>
    </section>
  </>
)}

       

       


    
       

      
    </main>
  );
}
