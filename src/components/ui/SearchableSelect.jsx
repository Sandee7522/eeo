"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";

/**
 * Searchable dropdown select with scroll.
 *
 * @param {{ value, onChange, options: Array<{label,value}|string>, placeholder, className, size }} props
 * - options: array of { label, value } or plain strings
 * - size: "sm" | "md" (default "md")
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  className = "",
  size = "md",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const inputRef = useRef(null);

  // Normalize options to { label, value }
  const normalized = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );

  // Filter by search
  const filtered = normalized.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  // Get display label for current value
  const selected = normalized.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const isSm = size === "sm";
  const btnPy = isSm ? "py-2" : "py-2.5";
  const btnText = isSm ? "text-xs" : "text-sm";

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`neu-select flex w-full items-center gap-2 appearance-none px-3 ${btnPy} ${btnText}`}
      >
        <span className={`flex-1 truncate text-left ${!selected ? "text-slate-600" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        {value && (
          <X
            className="h-3 w-3 shrink-0 text-slate-600 hover:text-slate-300"
            onClick={handleClear}
          />
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl"
          style={{
            background: "#151c32",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Search input */}
          <div className="border-b px-2.5 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border-none bg-transparent py-1.5 pl-7.5 pr-2 text-xs text-slate-200 placeholder-slate-600 outline-none"
                style={{
                  background: "rgba(12,18,32,0.6)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  paddingLeft: "28px",
                }}
              />
            </div>
          </div>

          {/* Options list with scroll */}
          <div className="max-h-48 overflow-y-auto overscroll-contain">
            {filtered.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-slate-600">
                No results found
              </div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
                className={`flex w-full items-center px-3 py-2 text-left text-xs transition-colors ${
                  o.value === value
                    ? "text-cyan-400"
                    : "text-slate-300 hover:text-white"
                }`}
                style={{
                  background: o.value === value ? "rgba(6,182,212,0.08)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (o.value !== value) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  if (o.value !== value) e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="truncate">{o.label}</span>
                {o.value === value && (
                  <svg className="ml-auto h-3.5 w-3.5 shrink-0 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
