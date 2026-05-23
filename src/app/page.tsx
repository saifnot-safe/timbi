import TimbiHeader from "@/components/TimbiHeader";
import MapPreview from "@/components/MapPreview";
import FoodCard from "@/components/FoodCard";
import HeroSection from "@/components/HeroSection";
import TodaysFoodSection from "@/components/TodaysFoodSection";

export default function Home() {
  return (
        <main className="min-h-screen bg-[#ffebd0]">

        <TimbiHeader />

        <HeroSection />

         <TodaysFoodSection />


    
       

      
    </main>
  );
}