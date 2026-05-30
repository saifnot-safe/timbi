"use client";

import { useRef } from "react";
import FoodCard from "./FoodCard";
import Image from "next/image";
import { foodEvents } from "@/data/foodEvents";

export default function TodaysFoodSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_AMOUNT = 312;

 function scrollRight() {
  const container = scrollRef.current;
  if (!container) return;

  const nearEnd =
    container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;

  if (nearEnd) {
    container.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    container.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  }
}

function scrollLeft() {
  const container = scrollRef.current;
  if (!container) return;

  const atStart = container.scrollLeft <= 10;

  if (atStart) {
    container.scrollTo({
      left: container.scrollWidth,
      behavior: "smooth",
    });
  } else {
    container.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  }
}

  return (
    <section id="todays-food" className="mx-auto max-w-6xl overflow-visible px-16 py-18 ">
    
        <h2 className="text-5xl font-bold text-[#DA7625]">
          Today&apos;s Finds
        </h2>

        <div className="relative">
            <button
            onClick={scrollLeft}
            className="absolute left-[-55px] top-1/2 z-10 flex -translate-y-1/2 items-center transition hover:scale-105"
          >
              <Image
                src="/Icons/timbi-arrow.png"
                alt="scroll left"
                width={100}
                height={100}
                className="scale-x-[-1]"
            />
           </button>

          <div
            ref={scrollRef}
            className="flex gap-16 overflow-x-auto overflow-y-hidden scroll-smooth px-20 pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"          >
           {foodEvents.map((event) => (
            <FoodCard
                key={event.id}
                title={event.title}
                location={event.building}
                time={event.endTime}
            />
            ))}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-[-55px] top-1/2 z-10 flex -translate-y-1/2 items-center transition hover:scale-105"
          >
              <Image
                src="/Icons/timbi-arrow.png"
                alt="scroll right"
                width={100}
                height={100}
            />
  
          </button>
        </div>
     
    </section>
  );
}