"use client";

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
}: FilterBarProps) {
  const dateOptions: { label: string; value: DateFilter }[] = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
    { label: "All Upcoming", value: "all" },
  ];

  return (
      <div className="mx-auto mt-24 mb-4 max-w-6xl px-8">
      <div className="flex flex-wrap gap-3">
      {dateOptions.map((option) => {
        const isActive = dateFilter === option.value;

        return (
            
          <button
            key={option.value}
            onClick={() => onDateFilterChange(option.value)}
            className={`rounded-2xl px-5 py-2 font-bold transition ${
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
      </div>
  );
}