"use client"

import TimbiHeader from "@/components/TimbiHeader";
import FoodCard from "@/components/FoodCard";
import HeroSection from "@/components/HeroSection";
import TodaysFoodSection from "@/components/TodaysFoodSection";
import dynamic from "next/dynamic"
import { useState } from "react";


const TimbiMap = dynamic(() => import("@/components/TimbiMap"), {
  ssr: false,
})



export default function Home() {

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  
  return (
        <main className="min-h-screen bg-[#ffebd0]">

        <TimbiHeader />

        <HeroSection />

         <TodaysFoodSection onSelectEvent = {setSelectedEventId} />

         <section id = "campus-map" className="mx-auto max-w-6xl px-8 pb-30">
          <TimbiMap selectedEventId={selectedEventId}   onSelectEvent={setSelectedEventId} />
           <div className="mt-2 text-center text-xs text-[#b28b6b]">
          Map data © OpenStreetMap contributors
        </div>
        </section>

       

       


    
       

      
    </main>
  );
}