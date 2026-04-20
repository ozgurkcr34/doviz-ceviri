"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CurrencyInfo } from "@/lib/currencies";

interface CurrencySelectProps {
  currencies: CurrencyInfo[];
  value: string;
  onChange: (code: string) => void;
  id: string;
}

export default function CurrencySelect({
  currencies,
  value,
  onChange,
  id,
}: CurrencySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = currencies.find((c) => c.code === value);

  const filtered = currencies.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  });

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector(".selected");
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
      if (e.key === "Enter" && filtered.length === 1) {
        handleSelect(filtered[0].code);
      }
    },
    [filtered, handleSelect]
  );

  return (
    <div className="select-wrapper" ref={wrapperRef} id={id}>
      <button
        type="button"
        className={`select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="select-trigger-text">
          {selected && (
            <>
              <span className="currency-flag">{selected.flag}</span>
              <span className="currency-code">{selected.code}</span>
            </>
          )}
        </span>
        <svg
          className="select-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown" role="listbox" onKeyDown={handleKeyDown}>
          <div className="dropdown-search">
            <input
              ref={searchRef}
              type="text"
              placeholder="Para birimi ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Para birimi ara"
            />
          </div>
          <div className="dropdown-list" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="dropdown-empty">Sonuç bulunamadı</div>
            ) : (
              filtered.map((currency) => (
                <div
                  key={currency.code}
                  className={`dropdown-item ${currency.code === value ? "selected" : ""}`}
                  onClick={() => handleSelect(currency.code)}
                  role="option"
                  aria-selected={currency.code === value}
                >
                  <span className="dropdown-item-flag">{currency.flag}</span>
                  <span className="dropdown-item-code">{currency.code}</span>
                  <span className="dropdown-item-name">{currency.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
