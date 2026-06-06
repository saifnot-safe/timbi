import { useState } from "react";
import { buildings } from "@/data/buildings";
import { FoodEvent } from "@/data/foodEvents";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onEventCreated: (event: FoodEvent) => void;
}


export default function PostFoodModal({ isOpen, onClose }: Props) {
  
    const [formData, setFormData] = useState({
      eventName: "",
      food: "",
      building: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      host: "",
      description: "",
      sourceUrl: "",
    });

    const times = generateTimeSlots();

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-8">
      <div className="timbi-scroll max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fff7eb] p-8 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#5f3d26]">
              Post food
            </h2>
            <p className="mt-1 text-sm text-[#8c6a52]">
              Help timbi feed campus :3
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-[#DA7625] transition hover:scale-110"
          >
            ×
          </button>
        </div>

        <form className="space-y-4">

          <div className="space-y-3">
          <p className="text-sm font-bold text-[#8c6a52]">What?</p>

          <input required className="timbi-input" placeholder="Event Name" />
          <input required className="timbi-input" placeholder="Food" />
        </div>

        <div className="space-y-3 relative">
       <p className="text-sm font-bold text-[#8c6a52]">Where?</p>
          <select value={formData.building} 
          onChange={(e) => setFormData({...formData, building: e.target.value})} 
          className="timbi-input required appearance-none">
            <option value="" disabled>Building</option>
           {Object.entries(buildings).map(([id, building]) => (
            <option key={id} value={id}>
              {building.name}
            </option>
          ))}
          
        </select>
            <span className="pointer-events-none text-color-[#8c6a52] absolute right-5 top-1/2 -translate-y-1/2">
              ▼
            </span>
        </div>

        <div className="space-y-3">
        <p className="text-sm font-bold text-[#111111]">When?</p>


        <input
          required
          type="date"
          value={formData.eventDate}
          onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
          className="timbi-input"
        />
      <div className="grid grid-cols-2 gap-3">
      <select
      required
      value={formData.startTime}
      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
      className="timbi-input "
    >
      <option value="" disabled>Start time</option>

      {times.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
c
    <select
      required
      value={formData.endTime}
      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
      className="timbi-input"
    >
      <option value="" disabled>End time</option>

      {times.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
       </select>
    </div>
    </div>

<div className="space-y-3">
  <p className="text-sm font-bold text-[#8c6a52]">Who?</p>
          <input required className="timbi-input " placeholder="Host" />
          <input required className="timbi-input " placeholder="Source URL" />
          <textarea className="timbi-input" placeholder="Description" />
    </div>

     <button
            type="submit"
            className="w-full rounded-2xl bg-[#ff9f05] px-6 py-4 font-bold text-white shadow-md transition hover:scale-[1.02]"
          >
            submit report
          </button>

      </form>
      </div>
     </div>

    );

  }

    function generateTimeSlots() {
      const slots = [];
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const period = hour < 12 ? "AM" : "PM";
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          const time = `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
          slots.push(time);
        }
      }
      return slots;
    }
  