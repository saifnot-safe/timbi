"use client"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { foodEvents } from "@/data/foodEvents"
import { buildings } from "@/data/buildings"
import { foods } from "@/data/foodCategories"

export default function TimbiMap() {

 return (
    
<div className="mx-auto h-[500px] w-full max-w-3xl overflow-hidden rounded-3xl shadow-lg">
          <MapContainer
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
    popupAnchor: [0, -42],
    className: "timbi-sticker",
  })

  return (
    <Marker
      key={event.id}
      position={[building.lat, building.lng]}
      icon={icon}
    >
      <Popup>
        <strong>{event.title}</strong>
        <br />
        {building.shortName}
        <br />
        {event.endTime}
      </Popup>
    </Marker>
  )
})}
      </MapContainer>
    </div>
  )
}
