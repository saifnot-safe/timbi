

"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"
import { Clock3, MapPin } from "lucide-react";

type FoodCardProps = {
  event: string
  food: string
  location: string
  date: string
  time: string
  onClick?: () => void
}

export default function FoodCard({ event, food, location, date, time, onClick }: FoodCardProps) {

  const cardRef = useRef<HTMLDivElement>(null)
  

  const swing = () => {
    const card = cardRef.current
    if (!card) return

    card.classList.remove("animate-card-swing")
    void card.offsetWidth
    card.classList.add("animate-card-swing")
  }


  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          swing()
        }
      },
      {
        threshold: 0.6,
      }
    )

    observer.observe(card)

    return () => observer.disconnect()
  }, [])

  return (
    <article className="relative h-56 w-60 shrink-0" onClick={onClick}>
      <div
        ref={cardRef}   
        className="relative h-full w-full transition-transform duration-300 hover:translate-y-1"
        style={{
          transformOrigin: "50% 12px",
        }}
        onMouseEnter={swing}
        onMouseLeave={swing}
      >
  
  <div className="absolute inset-0 rounded-3xl w-68 h-36 shrink-0 bg-[#FFEFDA] shadow-[0_10px_25px_rgba(0,0,0,0.08)]" />

  <Image
  src="/cards/timbi-thumbtack.png"
  alt=""
  width={34}
  height={34}
  className="absolute left-1/2 top-0 z-20 -translate-x-1/2+6 -translate-y-5"
/>

  <div className="absolute left-8 top-3 z-10 w-[220px]">
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <h3 className="line-clamp-1 text-2xl font-bold text-[#5f3d26]">
        {event}
      </h3>
      <p className="line-clamp-1 text-xl text-[#5f3d26]">{food}</p>
    </div>

    <p className="shrink-0 rounded-full bg-[#fff7eb] px-2 py-1 text-xs font-bold  text-[#FFA353]">
      {date}
    </p>
  </div>

  <div className="mt-2 space-y-1 text-[#5f3d26]">
    <div className="flex items-center gap-1.5">
      <MapPin size={15} className="shrink-0 text-[#FFA353]" />
      <p className="line-clamp-1 text-base">{location}</p>
    </div>

    <div className="flex items-center gap-1.5 text-[#5f3d26]">
      <Clock3 size={15} className="shrink-0 text-[#FFA353]" />
      <p className="whitespace-pre-line text-base leading-tight">{time}</p>
    </div>
  </div>
</div>
</div>
</article>
  );
}