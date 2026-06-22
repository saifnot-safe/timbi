"use client";

import { useState, useRef, useEffect } from "react";
import { categories } from "@/data/foodCategories";
import { buildings, type BuildingId } from "@/data/buildings";
import { Building2, ChevronDown } from "lucide-react";

type DateFilter = "today" | "week" | "all";

type FilterBarProps = {
  dateFilter: DateFilter;
  onDateFilterChange: (f: DateFilter) => void;
  categoryFilter: string[];
  onCategoryFilterChange: (c: string[]) => void;
  buildingFilter: string[];
  onBuildingFilterChange: (b: string[]) => void;
};

export default function FilterBar({
  dateFilter,
  onDateFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  buildingFilter,
  onBuildingFilterChange,
}: FilterBarProps) {
  const dateOptions: { label: string; value: DateFilter }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "All Events", value: "all" },
  ];

  const [buildingMenuOpen, setBuildingMenuOpen] = useState(false);
  const buildingMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        buildingMenuRef.current &&
        !buildingMenuRef.current.contains(e.target as Node)
      ) {
        setBuildingMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleCategory(key: string) {
    onCategoryFilterChange(
      categoryFilter.includes(key)
        ? categoryFilter.filter((c) => c !== key)
        : [...categoryFilter, key]
    );
  }

  function toggleBuilding(key: string) {
    onBuildingFilterChange(
      buildingFilter.includes(key)
        ? buildingFilter.filter((b) => b !== key)
        : [...buildingFilter, key]
    );
  }

  const buildingEntries = Object.entries(buildings) as [
    BuildingId,
    typeof buildings[BuildingId]
  ][];

  return (
    <div className="mx-auto mt-12 mb-4 max-w-6xl px-8">
      <div className="grid gap-3 lg:grid-cols-[380px_1fr] lg:gap-8">

        <div className="grid grid-cols-3 gap-3">
          {dateOptions.map((option) => {
            const isActive = dateFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onDateFilterChange(option.value)}
                className={`rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition ${
                  isActive
                    ? "bg-[#DA7625] text-white"
                    : "bg-white/60 text-[#6b422b] hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex mr-10 items-center justify-between gap-2">
          
            {Object.entries(categories).map(([key, cat]) => {
              const isActive = categoryFilter.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
               className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition ${
                isActive
                  ? "bg-[#DA7625] text-white"
                  : " bg-white/60 text-[#6b422b] hover:bg-white"
              }`}
                >
                  <img src={cat.icon} alt="" className="h-4 w-4 object-contain" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          

          <div className="relative shrink-0" ref={buildingMenuRef}>
            <button
              onClick={() => setBuildingMenuOpen((open) => !open)}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition ${
                buildingFilter.length > 0
                  ? "bg-[#DA7625] text-white"
                  : "bg-[#FFA353] text-white hover:bg-[#ff9638]"
              }`}
            >
              <Building2 size={15} />
              <span>
                {buildingFilter.length > 0
                  ? `Buildings (${buildingFilter.length})`
                  : "Buildings"}
              </span>
              <ChevronDown size={15} />
            </button>

            {buildingMenuOpen && (
              <div className="timbi-scroll absolute right-0 z-999 mt-2 max-h-72 w-56 overflow-y-auto rounded-2xl border-2 border-[#FFE0B8] bg-[#fff7eb] p-2 shadow-lg">
                {buildingFilter.length > 0 && (
                  <button
                    onClick={() => onBuildingFilterChange([])}
                    className="mb-1 w-full rounded-lg px-3 py-1.5 text-left text-sm font-bold text-[#DA7625] hover:bg-[#FFF3E2]"
                  >
                    Clear all
                  </button>
                )}
                {buildingEntries.map(([key, building]) => {
                  const isActive = buildingFilter.includes(key);
                  return (
                    <label
  key={key}
  className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#5f3d26] hover:bg-[#FFF3E2]"
>
  <input
    type="checkbox"
    checked={isActive}
    onChange={() => toggleBuilding(key)}
    className="peer sr-only"
  />
  <span
    className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border-2 transition ${
      isActive
        ? "border-[#FFA353] bg-[#FFA353]"
        : "border-[#FFA353] bg-white"
    }`}
  >
    {isActive && (
      <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-white stroke-[2.5]">
        <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </span>
  {building.shortName}
</label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}