"use client"
import { Nunito, Gaegu } from "next/font/google";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { foodEvents } from "@/data/foodEvents"
import { buildings } from "@/data/buildings"
import { foods } from "@/data/foodCategories"
import { useEffect, useRef, useState } from "react"
import type { Marker as LeafletMarker, Map as LeafletMap } from "leaflet"

 type TimbiMapProps = {
  selectedEventId: number | null
  onSelectEvent: (eventId: number|null) => void
}

  const nunito = Nunito({
  subsets: ["latin"],
});
 

export default function TimbiMap({selectedEventId, onSelectEvent,}: TimbiMapProps) {



const mapRef = useRef<LeafletMap | null>(null)
const markerRefs = useRef<Record<number, LeafletMarker | null>>({})



const selectedEvent = foodEvents.find(
  event => event.id === selectedEventId
)


const selectedBuilding = selectedEvent ? buildings[selectedEvent.building] : null

useEffect(() => {
  if (!selectedEventId || !selectedBuilding) return

  mapRef.current?.flyTo(
    [selectedBuilding.lat, selectedBuilding.lng],
    18,
    {
      duration: 0.8,
    }
  )

  setTimeout(() => {
    markerRefs.current[selectedEventId]?.openPopup()
  }, 650)
}, [selectedEventId, selectedBuilding])

 return (
    
<div className="relative mx-auto h-[500px] w-full max-w-3xl overflow-hidden rounded-3xl shadow-lg">
          <MapContainer
        ref={mapRef}
        center={[43.0096, -81.2737]}
        zoom={17}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />        

  {foodEvents.map((event) => {
  const building = buildings[event.building]
  const food = foods[event.food]

  const icon = L.icon({
    iconUrl: food.icon,
    iconSize: [56, 56],
    iconAnchor: [32, 32],
    popupAnchor: [-5, -36],
    className: "timbi-map-sticker",
  })

  return (
    <Marker
    ref={(marker) => {
    markerRefs.current[event.id] = marker
     }}
      key={event.id}
      position={[building.lat, building.lng]}
      icon={icon}
      eventHandlers={{
      click: () => {
        if (selectedEventId === event.id) {
          onSelectEvent(null)
        } else {
          onSelectEvent(event.id)
        }
      },
    }}
    >
      <Popup className = {`timbi-popup ${nunito.className}`} closeButton={false}
      eventHandlers={{
      remove: () => {
      onSelectEvent(null)
      },
    }}>
          <div className="font-bold text-[#5f3d26]">
            {event.title}
          </div>

          <div className="text-[#5f3d26]">
            {building.shortName}
          </div>

          <div className="text-[#FFA353]">
            {event.startTime} - {event.endTime}
          </div>
              </Popup>
            </Marker>

          )
        })}
      </MapContainer>

    {selectedEvent && selectedBuilding && (
    <div className={`absolute right-0 top-0 z-[99999] h-full w-80 bg-white p-6 shadow-2xl ${nunito.className}`}>

      <h3 className="text-2xl font-bold text-[#5f3d26]">
        {selectedEvent.eventName}
      </h3>

      <p className="mt-3 text-sm text-[#8c6a52]">
        {selectedEvent.title}
      </p>

      <div className="mt-6 space-y-3 text-[#5f3d26]">
        <p>{selectedBuilding.name}</p>

        <p className="font-bold text-[#FFA353]">
          {selectedEvent.startTime} - {selectedEvent.endTime}
        </p>

        <p>{selectedEvent.host}</p>

        <p className="leading-relaxed">
          {selectedEvent.description}
        </p>
      </div>
    </div>
)}
    </div>
  )
}
