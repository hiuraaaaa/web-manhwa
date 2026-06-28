"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { GENRES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultQuery?: string;
  defaultStatus?: string;
  defaultGenre?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
];

export function SearchBar({ defaultQuery = "", defaultStatus = "", defaultGenre = "" }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(defaultQuery);
  const [status, setStatus] = useState(defaultStatus);
  const [genre, setGenre] = useState(defaultGenre);

  function applyFilters(newQ = q, newStatus = status, newGenre = genre) {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newStatus) params.set("status", newStatus);
    if (newGenre) params.set("genre", newGenre);
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    setQ("");
    setStatus("");
    setGenre("");
    router.push(pathname);
  }

  const hasFilter = q || status || genre;

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Cari manhwa..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-bg-elevated border border-bg-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-colors"
        />
        {q && (
          <button onClick={() => { setQ(""); applyFilters(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); applyFilters(q, opt.value, genre); }}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                status === opt.value
                  ? "bg-accent border-accent text-white"
                  : "border-bg-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Genre select */}
        <select
          value={genre}
          onChange={(e) => { setGenre(e.target.value); applyFilters(q, status, e.target.value); }}
          className="px-3 py-1 text-xs rounded-full bg-bg-elevated border border-bg-border text-text-secondary focus:outline-none focus:border-accent/50 transition-colors"
        >
          <option value="">Semua Genre</option>
          {GENRES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {hasFilter && (
          <button onClick={clearAll} className="text-xs text-text-muted hover:text-accent transition-colors flex items-center gap-1">
            <X className="w-3 h-3" /> Reset filter
          </button>
        )}
      </div>
    </div>
  );
}
