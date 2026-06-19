"use client"

import Image from "next/image"
import { useRef } from "react"
import { Clock3, MapPin } from "lucide-react";
import { titleCase } from "@/lib/titleCase";

type FoodCardProps = {
  event: string
  food: string
  location: string
  date: string
  time: string
  isSelected?: boolean
  onClick?: () => void
}

export default function FoodCard({ event, food, location, date, time, isSelected, onClick }: FoodCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const swing = () => {
    const card = cardRef.current
    if (!card) return

    card.classList.remove("animate-card-swing")
    void card.offsetWidth
    card.classList.add("animate-card-swing")
  }

  return (
    <article
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={swing}
      style={{ transformOrigin: "15% 0" }}
      className={`relative flex w-full cursor-pointer items-start gap-3 rounded-2xl px-4 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-colors duration-200 ${
        isSelected
          ? "bg-[#FFE3BE] ring-2 ring-[#FFA353]"
          : "bg-[#FFEFDA] hover:bg-[#FFE9CC]"
      }`}
    >
      <Image
        src="/cards/timbi-thumbtack.png"
        alt=""
        width={25}
        height={25}
        className="absolute -left-0 -top-2 z-10"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-bold text-[#5f3d26]">
            {titleCase(event)}
          </h3>
          <p className="shrink-0 rounded-full bg-[#fff7eb] px-2 py-0.5 text-xs font-bold text-[#FFA353]">
            {date}
          </p>
        </div>

        <p className="line-clamp-1 text-sm text-[#5f3d26]">{titleCase(food)}</p>

        <div className="mt-1.5 flex items-center gap-3 text-[#5f3d26]">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="shrink-0 text-[#FFA353]" />
            <p className="line-clamp-1 text-sm">{location}</p>
          </div>
          <div className="flex items-center gap-1">
            <Clock3 size={14} className="shrink-0 text-[#FFA353]" />
            <p className="whitespace-pre-line text-sm leading-tight">{time}</p>
          </div>
        </div>
      </div>
    </article>
  )
}