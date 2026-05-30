"use client"

import TimbiHeader from "@/components/TimbiHeader";
import MapPreview from "@/components/MapPreview";
import FoodCard from "@/components/FoodCard";
import HeroSection from "@/components/HeroSection";
import TodaysFoodSection from "@/components/TodaysFoodSection";
import dynamic from "next/dynamic"

const TimbiMap = dynamic(() => import("@/components/TimbiMap"), {
  ssr: false,
})

export default function Home() {
  return (
        <main className="min-h-screen bg-[#ffebd0]">

        <TimbiHeader />

        <HeroSection />

         <TodaysFoodSection />

         <section className="mx-auto max-w-6xl px-8 pb-30">
          <TimbiMap />
           <div className="mt-2 text-center text-xs text-[#b28b6b]">
          Map data © OpenStreetMap contributors
        </div>
        </section>

       

       


    
       

      
    </main>
  );
}