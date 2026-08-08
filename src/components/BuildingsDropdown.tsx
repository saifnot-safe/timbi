"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildings, type BuildingId } from "@/data/buildings";
import { Building2, ChevronDown, Search } from "lucide-react";

type BuildingsDropdownProps = {
  buildingFilter: string[];
  onBuildingFilterChange: (b: string[]) => void;
};

type BuildingEntry = [BuildingId, (typeof buildings)[BuildingId]];

function matchesQuery(building: (typeof buildings)[BuildingId], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (building.name.toLowerCase().includes(q)) return true;
  if (building.shortName.toLowerCase().includes(q)) return true;
  return building.aliases.some((alias) => alias.toLowerCase().includes(q));
}

export default function BuildingsDropdown({
  buildingFilter,
  onBuildingFilterChange,
}: BuildingsDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const buildingEntries = Object.entries(buildings) as BuildingEntry[];

  const selectedEntries = buildingEntries.filter(([key]) =>
    buildingFilter.includes(key)
  );
  const unselectedMatches = buildingEntries.filter(
    ([key, building]) => !buildingFilter.includes(key) && matchesQuery(building, query)
  );

  const visibleEntries = useMemo(
    () => [...selectedEntries, ...unselectedMatches],
    [selectedEntries, unselectedMatches]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setActiveIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    if (activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  function toggleBuilding(key: string) {
    onBuildingFilterChange(
      buildingFilter.includes(key)
        ? buildingFilter.filter((b) => b !== key)
        : [...buildingFilter, key]
    );
  }

  function closeAndRefocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visibleEntries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = visibleEntries[activeIndex];
      if (target) toggleBuilding(target[0]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeAndRefocusTrigger();
    }
  }

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
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

      {open && (
        <div
          onKeyDown={handleKeyDown}
          className="absolute right-0 z-999 mt-2 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-2 border-[#FFE0B8] bg-[#fff7eb] shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-[#FFE0B8] px-3 py-2">
            <Search size={14} className="shrink-0 text-[#b28b6b]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search buildings..."
              className="w-full bg-transparent text-sm text-[#5f3d26] outline-none placeholder:text-[#b28b6b]"
            />
            {buildingFilter.length > 0 && (
              <button
                onClick={() => onBuildingFilterChange([])}
                className="shrink-0 text-xs font-bold text-[#DA7625] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="timbi-scroll max-h-64 overflow-y-auto p-2">
            {selectedEntries.length === 0 && unselectedMatches.length === 0 ? (
              <p className="px-3 py-2 text-sm text-[#8c6a52]">No buildings match</p>
            ) : (
              <>
                {selectedEntries.map(([key, building]) => {
                  const index = visibleEntries.findIndex(([k]) => k === key);
                  return (
                    <BuildingOption
                      key={key}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      building={building}
                      isSelected
                      isActive={index === activeIndex}
                      onClick={() => toggleBuilding(key)}
                    />
                  );
                })}

                {selectedEntries.length > 0 && unselectedMatches.length > 0 && (
                  <div className="my-1 border-t border-[#FFE0B8]" />
                )}

                {selectedEntries.length > 0 &&
                  unselectedMatches.length === 0 &&
                  query.trim() !== "" && (
                    <p className="px-3 py-2 text-sm text-[#8c6a52]">No buildings match</p>
                  )}

                {unselectedMatches.map(([key, building]) => {
                  const index = visibleEntries.findIndex(([k]) => k === key);
                  return (
                    <BuildingOption
                      key={key}
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      building={building}
                      isSelected={false}
                      isActive={index === activeIndex}
                      onClick={() => toggleBuilding(key)}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type BuildingOptionProps = {
  building: (typeof buildings)[BuildingId];
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
};

function BuildingOption({
  ref,
  building,
  isSelected,
  isActive,
  onClick,
}: BuildingOptionProps & { ref: (el: HTMLButtonElement | null) => void }) {
  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-[#5f3d26] transition ${
        isActive ? "bg-[#FFE0B8]" : "hover:bg-[#FFF3E2]"
      }`}
    >
      <span
        className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border-2 transition ${
          isSelected ? "border-[#FFA353] bg-[#FFA353]" : "border-[#FFA353] bg-white"
        }`}
      >
        {isSelected && (
          <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none stroke-white stroke-[2.5]">
            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {building.shortName}
    </button>
  );
}
