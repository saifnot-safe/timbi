import { useState } from "react";
import { buildings } from "@/data/buildings";
import { FoodEvent } from "@/types/FoodEvent";
import { supabase } from "@/lib/supabase";
import { categoryKeywords, FoodCategory } from "@/data/foodCategories";

type Props = {
  isOpen: boolean;
  onClose: () => void;
 onEventCreated: () => Promise<void>;
}

const times = generateTimeSlots();


export default function PostFoodModal({ isOpen, onClose, onEventCreated }: Props) {
  
    const [formData, setFormData] = useState({
      eventName: "",
      food: "",
      building: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      host: "",
      description: "",
      sourceUrl: "",
    });

    if (!isOpen) return null;

    function updateField(field: string, value: string) {

      if (field === "startDate" && !formData.endDate) {
  setFormData({
    ...formData,
    startDate: value,
    endDate: value,
  });
  return
      }
    setFormData({
      ...formData,
      [field]: value,
    });


  }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      const startIndex = times.findIndex((time) => time.value === formData.startTime);
const endIndex = times.findIndex((time) => time.value === formData.endTime);

      if (
      formData.startDate === formData.endDate &&
      endIndex <= startIndex
    ) {
      alert("End time must be after start time");
      return;
    }

    if (formData.endDate < formData.startDate) {
      alert("End date must be after start date");
      return;
    }

    let sourceUrl = formData.sourceUrl;

    if (!sourceUrl.startsWith("http://") && !sourceUrl.startsWith("https://")) {
        sourceUrl = `https://${sourceUrl}`;
      }

        try {
      new URL(sourceUrl);
      const url = new URL(sourceUrl);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        alert("Please enter a valid URL");
        return;
      }
    } catch {
      alert("Please enter a valid URL");
      return;
    }

    const { data, error } = await supabase
    .from("food_events")
    .insert({
      event_name: formData.eventName,
      food: formData.food,
      category: detectFoodCategory(formData.food),
      building: formData.building,
      start_date: formData.startDate,
      end_date: formData.endDate,
      start_time: formData.startTime,
      end_time: formData.endTime,
      host: formData.host,
      description: formData.description,
      source_url: sourceUrl,
      is_verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("Could not submit event");
    return;
  }

      await onEventCreated();
      onClose();
    }

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-8">
      <div className="timbi-scroll max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[#fff7eb] p-8 text-left shadow-2xl">
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


        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="space-y-3">
          <p className="text-sm font-bold text-[#8c6a52]">What?*</p>

          <input 
          required 
          value={formData.eventName}
          className="timbi-input" 
          onChange={(e) => updateField("eventName", e.target.value)}
          placeholder="Event Name" />

          <input 
          required 
          value={formData.food}
          className="timbi-input" 
          onChange={(e) => updateField("food", e.target.value)}
          placeholder="Food" />
        </div>

        <div className="space-y-3">
       <p className="text-sm font-bold text-[#8c6a52]">Where?*</p>

          <select 
          required
          value={formData.building} 
          onChange={(e) => updateField("building", e.target.value)} 
          className="timbi-input">

            <option value="" disabled>
              Building
            </option>
            
           {Object.entries(buildings).map(([id, building]) => (
            <option key={id} value={id}>
              {building.name}
            </option>
          ))}

          </select>
      </div>
          
      

        <div className="space-y-3">
        <p className="text-sm font-bold text-[#8c6a52]">When?*</p>

<div className="grid grid-cols-2 gap-3">
        <input
          required
          type="date"
          value={formData.startDate}
          onChange={(e) => updateField("startDate", e.target.value)}
          className="timbi-input"
        />

         <input
          required
          type="date"
          value={formData.endDate}
          onChange={(e) => updateField("endDate", e.target.value)}
          className="timbi-input"
        />
        </div>

      <div className="grid grid-cols-2 gap-3">

      <select
      required
      value={formData.startTime}
      onChange={(e) => updateField("startTime", e.target.value)}
      className="timbi-input "
    >
      <option value="" disabled>
        Start time
      </option>

     {times.map((time) => (
      <option key={time.value} value={time.value}>
        {time.label}
      </option>
    ))}
    </select>

    <select
      required
      value={formData.endTime}
      onChange={(e) => updateField("endTime", e.target.value)}
      className="timbi-input"
    >
      <option value="" disabled>
        End time
      </option>

     {times.map((time) => (
  <option key={time.value} value={time.value}>
    {time.label}
  </option>
))}
       </select>
    </div>
    </div>

<div className="space-y-3">
  <p className="text-sm font-bold text-[#8c6a52]">Who?*</p>

          <input 
          value={formData.host}
          required 
          className="timbi-input" 
          onChange={(e) => updateField("host", e.target.value)}
          placeholder="Host" />
          <input 
          required 
          value={formData.sourceUrl}
          className="timbi-input" 
          onChange={(e) => updateField("sourceUrl", e.target.value)}
          placeholder="Source URL" />
        
    </div>

    <div className="space-y-3">
  <p className="text-sm font-bold text-[#8c6a52]">Additional Details</p>

    <textarea 
          className="timbi-input" 
          placeholder="Description" 
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
        />

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

      const label = `${displayHour
        .toString()
        .padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${period}`;

      const value = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;

      slots.push({ label, value });
    }
  }

  return slots;
}

  function detectFoodCategory(food: string): FoodCategory {
  const text = food.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category as FoodCategory;
    }
  }

  return "meal";
}
  