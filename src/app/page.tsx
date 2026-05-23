import TimbiHeader from "@/components/TimbiHeader";
import MapPreview from "@/components/MapPreview";
import FoodCard from "@/components/FoodCard";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  return (
        <main className="min-h-screen bg-[#ffebd0]">

        <TimbiHeader />

        <HeroSection />

        <section className="flex flex-col items-center gap-6 px-4 pt-4">
        <section className="flex gap-4 overflow-x-auto pb-2">
          
        </section>

        <MapPreview />
        </section>

      
    </main>
  );
}