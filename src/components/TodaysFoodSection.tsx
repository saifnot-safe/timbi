"use client";

import { useRef } from "react";
import FoodCard from "./FoodCard";
import Image from "next/image";

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
    <section className="px-8 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-6 text-4xl font-bold text-[#DA7625]">
          Today&apos;s food
        </h2>

        <div className="relative">
            <button
            onClick={scrollLeft}
            className="absolute left-[-100px] top-1/2 z-10 flex -translate-y-1/2 items-center transition hover:scale-105"
          >
              <Image
                src="/timbi/timbi-arrow.png"
                alt="scroll left"
                width={100}
                height={100}
                className="scale-x-[-1]"
            />
           </button>

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <FoodCard
              title="Pizza"
              location="Engineering Atrium"
              time="Ends at 2:30 PM"
            />
            <FoodCard
              title="Pizza"
              location="Engineering Atrium"
              time="Ends at 2:30 PM"
            />
            <FoodCard
              title="Pizza"
              location="Engineering Atrium"
              time="Ends at 2:30 PM"
            />
            <FoodCard
              title="Donuts"
              location="Weldon Library"
              time="Ends at 4:00 PM"
            />
            <FoodCard
              title="Coffee"
              location="UCC"
              time="Ends at 5:00 PM"
            />
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-[-100px] top-1/2 z-10 flex -translate-y-1/2 items-center transition hover:scale-105"
          >
              <Image
                src="/timbi/timbi-arrow.png"
                alt="scroll right"
                width={100}
                height={100}
            />
  
          </button>
        </div>
      </div>
    </section>
  );
}