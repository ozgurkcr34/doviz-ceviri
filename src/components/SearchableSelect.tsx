"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface Props {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Seçiniz",
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = options.filter((o) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      o.value.toLowerCase().includes(q) ||
      o.label.toLowerCase().includes(q) ||
      (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  });

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Scroll selected into view
  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector("[data-selected]");
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setQuery("");
    },
    [onChange]
  );

  // Trigger display: show icon+code for currencies, just label for units
  const triggerLabel = selected
    ? selected.icon
      ? selected.value
      : selected.label
    : placeholder;

  return (
    <div className="relative" ref={containerRef} id={id}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={[
          "w-full h-14 flex items-center justify-between gap-2",
          "px-4 border bg-white text-left",
          "transition-colors duration-150 cursor-pointer",
          open
            ? "border-neutral-400"
            : "border-neutral-200 hover:border-neutral-300",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 truncate min-w-0">
          {selected?.icon && (
            <span className="text-base leading-none flex-shrink-0">
              {selected.icon}
            </span>
          )}
          <span className="font-semibold text-sm tracking-wide truncate">
            {triggerLabel}
          </span>
          {selected?.icon && selected?.label && (
            <span className="text-xs text-neutral-400 truncate hidden sm:inline">
              {selected.label}
            </span>
          )}
        </span>
        <ChevronDown
          className={[
            "w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 top-full left-0 right-0 mt-px bg-white border border-neutral-200 shadow-lg shadow-neutral-200/60 max-h-72 flex flex-col"
          role="listbox"
        >
          {/* Search */}
          {options.length > 5 && (
            <div className="p-2 border-b border-neutral-100 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                      setQuery("");
                    }
                    if (e.key === "Enter" && filtered.length === 1) {
                      handleSelect(filtered[0].value);
                    }
                  }}
                  placeholder="Ara..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-neutral-50 border border-neutral-100 outline-none focus:border-neutral-300 placeholder:text-neutral-300"
                  aria-label="Ara"
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto flex-1" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-neutral-400">
                Sonuç bulunamadı
              </div>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-neutral-100"
                        : "hover:bg-neutral-50",
                    ].join(" ")}
                    role="option"
                    aria-selected={isSelected}
                    {...(isSelected ? { "data-selected": true } : {})}
                  >
                    {option.icon && (
                      <span className="text-base leading-none flex-shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <span className="font-semibold text-sm flex-shrink-0 w-10">
                      {option.icon ? option.value : ""}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">
                      {option.label}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-neutral-900 ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
