"use client"
import { Nunito } from "next/font/google";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { FoodEvent } from "@/types/FoodEvent";
import { buildings } from "@/data/buildings"
import { categories } from "@/data/foodCategories"
import { titleCase } from "@/lib/titleCase";
import { useEffect, useRef, useState } from "react"
import type { Marker as LeafletMarker, Map as LeafletMap } from "leaflet"
import {
  MapPin,
  Clock3,
  User,
  ExternalLink,
  AlertTriangle
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

function getPanelAdjustedCenter(lat: number, lng: number) {
  const map = mapRef.current;
  if (!map) return L.latLng(lat, lng);

  const isMobile = window.innerWidth < 1024; 
  const zoom = 18;
  const point = map.project(L.latLng(lat, lng), zoom);

  if (isMobile) {
    point.y += 70;
  } else {
    point.x += 0;
  }

  const adjusted = map.unproject(point, zoom);

  if (!Number.isFinite(adjusted.lat) || !Number.isFinite(adjusted.lng)) {
    return L.latLng(lat, lng);
  }

  return adjusted;
}


const selectedEvent = events.find(
  event => event.id === selectedEventId
)

const selectedFood = selectedEvent
  ? categories[selectedEvent.category]
  : null

const selectedBuilding = selectedEvent ? buildings[selectedEvent.building] : null

useEffect(() => {
  if (selectedEventId === null || !selectedBuilding) return;

  const lat = Number(selectedBuilding.lat);
  const lng = Number(selectedBuilding.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log("Bad building coords:", selectedBuilding);
    return;
  }

  const map = mapRef.current;
  const marker = markerRefs.current[selectedEventId];

  if (!map || !marker) return;

  map.invalidateSize();

  const target = L.latLng(lat, lng);
  const adjustedCenter = getPanelAdjustedCenter(lat, lng);

  if (map.getCenter().distanceTo(adjustedCenter) >= 5) {
    map.flyTo(adjustedCenter, 18, {
      duration: 0.8,
    });

    setTimeout(() => {
      markerRefs.current[selectedEventId]?.openPopup();
    }, 650);
  } else {
    marker.openPopup();
  }
}, [selectedEventId, selectedBuilding]);

const [animatingOutId, setAnimatingOutId] = useState<number | null>(null);


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

const isSelected = selectedEventId === event.id;

const isDeselecting =
  animatingOutId === event.id &&
  selectedEventId !== event.id;

const showTimbi = isSelected || isDeselecting;

const icon = L.divIcon({
  className: "",
  iconSize: [56, 56],
  iconAnchor: [28, 42],
  html: `
    <div class="timbi-marker ${
      isSelected ? "timbi-marker-selected" : ""
    } ${
      isDeselecting ? "timbi-marker-deselecting" : ""
    }">
      <img src="${food.icon}" class="timbi-marker-food" />
      <img src="/pins/timbi-anim.webp" class="timbi-marker-buddy" />
    </div>
  `,
});

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
  if (selectedEventId === event.id) {
    setAnimatingOutId(event.id);

    setTimeout(() => {
      setAnimatingOutId(null);
    }, 250);

    onSelectEvent(null);
  } else {
    onSelectEvent(event.id);
  }
},
    popupclose: () => {
      if (selectedEventId === event.id) {
        onSelectEvent(null)
      }
    },
  }}
>
            </Marker>

          )
        })}
      </MapContainer>

   {selectedEvent && selectedBuilding && selectedFood && (
  <div
    className="timbi-scroll absolute z-[400] rounded-3xl bg-white/90 shadow-2xl backdrop-blur-sm
      inset-x-3 bottom-3 max-h-[45%] overflow-y-auto p-5
      lg:inset-x-auto lg:bottom-auto lg:top-4 lg:right-4 lg:w-60 lg:max-h-[calc(100%-2rem)] lg:p-5"
  >
    <h3 className="text-2xl font-bold text-[#5f3d26]">
      {titleCase(selectedEvent.eventName)}
    </h3>

    <p className={`mt-3 text-sm text-[#8c6a52] ${nunito.className}`}>
      {titleCase(selectedEvent.food)}
    </p>

    <div className="mt-6 space-y-5 text-[#5f3d26]">

      <div className="flex items-center gap-2">
        <MapPin size={18} className="shrink-0 text-[#FFA353]" />
        <p className={nunito.className}>{selectedBuilding.name}</p>
      </div>

      <div className="flex gap-2 text-[#5f3d26]">
        <Clock3 size={18} className="mt-0.5 shrink-0 text-[#FFA353]" />
        <div className={`whitespace-pre-line ${nunito.className}`}>
          {formatEventDate(selectedEvent)}
          <p className="text-sm text-[#8c6a52]">
            {formatEventTime(selectedEvent)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <User size={18} className="shrink-0 text-[#FFA353]" />
        <p
  className={`min-w-0 truncate ${nunito.className}`}
  title={selectedEvent.host}
>
  {selectedEvent.host}
</p>
      </div>

      {selectedEvent.description && (
        <p className={`leading-relaxed ${nunito.className}`}>{selectedEvent.description}</p>
      )}

      {selectedEvent.sourceUrl ? (
        <a
  
    href={selectedEvent.sourceUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-6 flex items-center gap-2 font-bold text-[#FFA353] hover:underline"
  >
    <ExternalLink size={18} />
    View Source
  </a>
) : (
  <div className={`mt-6 flex items-center gap-2 font-bold text-[#9a9a9a]`}>
    <AlertTriangle size={18} className="shrink-0" />
    No source
  </div>
)}

    </div>

    
  </div>
)}
    </div>
  )
}
