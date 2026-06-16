"use client"
import { Nunito } from "next/font/google";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { FoodEvent } from "@/types/FoodEvent";
import { buildings } from "@/data/buildings"
import { categories } from "@/data/foodCategories"
import { useEffect, useRef } from "react"
import type { Marker as LeafletMarker, Map as LeafletMap } from "leaflet"
import {
  MapPin,
  Clock3,
  User,
  ExternalLink,
} from "lucide-react";

 type TimbiMapProps = {
  events: FoodEvent[];
  selectedEventId: number | null
  onSelectEvent: (eventId: number|null) => void
   formatEventDate: (event: FoodEvent) => string;
   formatEventTime: (event: FoodEvent) => string;
  formatEventDateTimeCompact:  (event: FoodEvent) => string;
}


  const nunito = Nunito({
  subsets: ["latin"],
});
 

export default function TimbiMap({
  events,
  selectedEventId,
  onSelectEvent,
  formatEventDate,
  formatEventTime,
  formatEventDateTimeCompact,
}: TimbiMapProps) {


const mapRef = useRef<LeafletMap | null>(null)
const markerRefs = useRef<Record<number, LeafletMarker | null>>({})



const selectedEvent = events.find(
  event => event.id === selectedEventId
)

const selectedFood = selectedEvent
  ? categories[selectedEvent.category]
  : null

const selectedBuilding = selectedEvent ? buildings[selectedEvent.building] : null

useEffect(() => {
  if (selectedEventId === null || !selectedBuilding) return

  const currentCenter = mapRef.current?.getCenter()
  const target = L.latLng(selectedBuilding.lat, selectedBuilding.lng)

  if (currentCenter && currentCenter.distanceTo(target) >= 5) {
    mapRef.current?.flyTo([selectedBuilding.lat, selectedBuilding.lng], 18, {
      duration: 0.8,
    })

    setTimeout(() => {
      markerRefs.current[selectedEventId]?.openPopup()
    }, 650)
  } else {
    markerRefs.current[selectedEventId]?.openPopup()
  }
}, [selectedEventId, selectedBuilding])

 return (
    
<div className="relative mx-auto h-[500px] w-full max-w-3xl overflow-hidden rounded-3xl shadow-lg">
        <MapContainer
        ref={mapRef}
        center={[43.0096, -81.2737]}
        zoom={18}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer
            attribution='&copy; OpenStreetMap &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />        

  {events.map((event) => {
  const building = buildings[event.building]
  const food = categories[event.category]

  const sameBuildingEvents = events.filter(
  (e) => e.building === event.building
  );

  const eventIndex = sameBuildingEvents.findIndex(
    (e) => e.id === event.id
  );

const angle = (eventIndex / sameBuildingEvents.length) * 2 * Math.PI;
const radius = 0.00010;

const markerLat = building.lat + Math.cos(angle) * radius;
const markerLng = building.lng + Math.sin(angle) * radius;

  const icon = L.icon({
    iconUrl: food.icon,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [1, -22],
    className: "timbi-map-sticker",
  })

  return (
   <Marker
  ref={(marker) => {
    markerRefs.current[event.id] = marker
  }}
  key={event.id}
  position={[markerLat, markerLng]}
  zIndexOffset={selectedEventId === event.id ? 1000 : 0}
  icon={icon}
  eventHandlers={{
    click: () => {
      onSelectEvent(selectedEventId === event.id ? null : event.id)
    },
    popupclose: () => {
      if (selectedEventId === event.id) {
        onSelectEvent(null)
      }
    },
  }}
>
      <Popup className = {`timbi-popup ${nunito.className}`} closeButton={false}>

          <div className="font-bold text-[#5f3d26]">
            {event.food}
          </div>

          <div className="text-[#5f3d26]">
            {building.shortName}
          </div>

          <div className="text-[#FFA353]">
            {formatEventTime(event)}
          </div>
              </Popup>
            </Marker>

          )
        })}
      </MapContainer>

   {selectedEvent && selectedBuilding && selectedFood && (
  <div
    className={`absolute right-0 top-0 z-[400] h-full w-65 bg-white p-6 shadow-2xl ${nunito.className}`}
  >
    <h3 className="text-2xl font-bold text-[#5f3d26]">
      {selectedEvent.eventName}
    </h3>

    <p className="mt-3 text-sm text-[#8c6a52]">
      {selectedFood.name}
    </p>

    <div className="mt-6 space-y-5 text-[#5f3d26]">

      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-[#FFA353]" />
        <p>{selectedBuilding.name}</p>
      </div>

      <div className="flex gap-2 text-[#5f3d26]">
        <Clock3
          size={18}
          className="mt-0.5 shrink-0 text-[#FFA353]"
        />
        <div className="whitespace-pre-line">
          {formatEventDate(selectedEvent)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <User size={18} className="text-[#FFA353]" />
        <p>{selectedEvent.host}</p>
      </div>

      {selectedEvent.description && (
        <p className="leading-relaxed">
          {selectedEvent.description}
        </p>
      )}

      <a
        href={selectedEvent.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex items-center gap-2 font-bold text-[#FFA353] hover:underline"
      >
        <ExternalLink size={18} />
        View Source
      </a>

    </div>
  </div>
)}
    </div>
  )
}
