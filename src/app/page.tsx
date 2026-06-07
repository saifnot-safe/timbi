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

const TimbiMap = dynamic(() => import("@/components/TimbiMap"), {
  ssr: false,
})




export default function Home() {

  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;
  const canPost = email?.endsWith("@uwo.ca");

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [events, setEvents] = useState<FoodEvent[]>([]);

  useEffect(() => {
  loadEvents();
}, []);

async function loadEvents() {
  console.log("loading events...");

  const { data, error } = await supabase
    .from("food_events")
    .select("*")
    .order("created_at", { ascending: false });

  console.log("supabase data:", data);
  console.log("supabase error:", error);

  if (error) return;

  const formattedEvents: FoodEvent[] = data.map((event) => ({
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
    description: event.description,
    sourceUrl: event.source_url,
    reporter: event.reporter,
    verified: event.verified,
  }));

  setEvents(formattedEvents);
}


  
  return (
        <main className="min-h-screen bg-[#ffebd0]">

          <p className="p-4 text-black">
  events loaded: {events.length}
</p>

        <TimbiHeader />

        <HeroSection onEventCreated={loadEvents}/>

         <TodaysFoodSection selectedEventId={selectedEventId} events= {events} onSelectEvent = {setSelectedEventId} />

         <section id = "campus-map" className="mx-auto max-w-6xl px-8 pb-30">
          <TimbiMap events={events} selectedEventId={selectedEventId}   onSelectEvent={setSelectedEventId} />
           <div className="mt-2 text-center text-xs text-[#b28b6b]">
          Map data © OpenStreetMap contributors
        </div>
        </section>

       

       


    
       

      
    </main>
  );
}