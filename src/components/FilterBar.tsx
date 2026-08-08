"use client";

import { categories } from "@/data/foodCategories";
import BuildingsDropdown from "@/components/BuildingsDropdown";

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

  function toggleCategory(key: string) {
    onCategoryFilterChange(
      categoryFilter.includes(key)
        ? categoryFilter.filter((c) => c !== key)
        : [...categoryFilter, key]
    );
  }

  return (
  <div className="mx-auto mt-12 mb-4 max-w-6xl px-4 lg:px-8">
      <div className="grid gap-3 lg:grid-cols-[380px_1fr] lg:gap-8">

        {/* date filters */}
        <div className="min-w-0 grid w-full grid-cols-3 gap-2 lg:w-auto">
          {dateOptions.map((option) => {
            const isActive = dateFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onDateFilterChange(option.value)}
                className={`min-w-0 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition ${
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

        {/* category + building */}
       <div className="flex w-full min-w-0 items-center gap-2 lg:mr-10 lg:justify-between">

          <div className="timbi-scroll flex flex-1 gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible  lg:pb-0">
            {Object.entries(categories).map(([key, cat]) => {
              const isActive = categoryFilter.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-bold shadow-sm transition ${
                    isActive
                      ? "bg-[#DA7625] text-white"
                      : "bg-white/60 text-[#6b422b] hover:bg-white"
                  }`}
                >
                  <img src={cat.icon} alt="" className="h-4 w-4 object-contain" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <BuildingsDropdown
            buildingFilter={buildingFilter}
            onBuildingFilterChange={onBuildingFilterChange}
          />
        </div>

      </div>
    </div>
  );
}