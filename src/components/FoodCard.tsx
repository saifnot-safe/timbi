

"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

type FoodCardProps = {
  event: string
  food: string
  location: string
  time: string
  onClick?: () => void
}

export default function FoodCard({ event, food, location, time, onClick }: FoodCardProps) {

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

  <div className="absolute left-8 top-3 z-10">
    <h3 className="text-2xl font-bold text-[#5f3d26] line-clamp-1">{event}</h3>
     <p className="text-xl  text-[#5f3d26]">{food}</p>
    <p className="text-base  text-[#5f3d26]">{location}</p>
    <p className="text-base  text-[#FFA353]">{time}</p>
  </div>
  </div>
</article>
  );
}