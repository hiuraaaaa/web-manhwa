"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, BookOpen, X } from "lucide-react";
import { ManhwaWithLatestChapter, STATUS_LABELS, ManhwaStatus, GENRES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-emerald-500",
  completed: "bg-blue-500",
  hiatus: "bg-amber-500",
};

interface Props {
  manhwaList: ManhwaWithLatestChapter[];
  bannerItems: ManhwaWithLatestChapter[];
  defaultQ?: string;
  defaultStatus?: string;
  defaultGenre?: string;
}

export function HomeClient({ manhwaList, bannerItems, defaultQ = "", defaultStatus = "", defaultGenre = "" }: Props) {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [q, setQ] = useState(defaultQ);
  const [status, setStatus] = useState(defaultStatus);
  const [genre, setGenre] = useState(defaultGenre);
  const [showSearch, setShowSearch] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance banner
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    autoRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [bannerItems.length]);

  function resetAuto() {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    }, 4000);
  }

  function prevBanner() {
    setCurrentBanner((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);
    resetAuto();
  }

  function nextBanner() {
    setCurrentBanner((prev) => (prev + 1) % bannerItems.length);
    resetAuto();
  }

  function applyFilters(newQ = q, newStatus = status, newGenre = genre) {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newStatus) params.set("status", newStatus);
    if (newGenre) params.set("genre", newGenre);
    router.push(`/?${params.toString()}`);
  }

  const hasFilter = q || status || genre;
  const banner = bannerItems[currentBanner];

  return (
    <div className="min-h-screen bg-white">
      {/* TOP NAV */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-13 flex items-center justify-between gap-3 py-2.5">
          <Link href="/" className="flex items-center gap-1.5 font-display font-bold text-lg text-gray-900 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            <span>ManhwaKu</span>
          </Link>

          {/* Search bar */}
          <div className={cn("flex-1 transition-all", showSearch ? "flex" : "hidden sm:flex")}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari manhwa..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:bg-gray-200 transition-colors"
              />
              {q && (
                <button onClick={() => { setQ(""); applyFilters(""); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <button className="sm:hidden flex-shrink-0" onClick={() => setShowSearch(!showSearch)}>
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Filter pills */}
        <div className="max-w-2xl mx-auto px-4 pb-2.5 flex gap-2 overflow-x-auto scrollbar-none">
          {["", "ongoing", "completed", "hiatus"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); applyFilters(q, s, genre); }}
              className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                status === s
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-red-300"
              )}
            >
              {s === "" ? "Semua" : STATUS_LABELS[s as ManhwaStatus]}
            </button>
          ))}
          <div className="w-px bg-gray-200 flex-shrink-0" />
          {GENRES.slice(0, 8).map((g) => (
            <button
              key={g}
              onClick={() => { setGenre(genre === g ? "" : g); applyFilters(q, status, genre === g ? "" : g); }}
              className={cn(
                "flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-colors",
                genre === g
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </header>

      {/* BANNER CAROUSEL */}
      {bannerItems.length > 0 && !hasFilter && (
        <div className="max-w-2xl mx-auto relative">
          <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-gray-900">
            {bannerItems.map((item, i) => (
              <Link
                key={item.id}
                href={`/manhwa/${item.slug}`}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  i === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
              >
                {item.cover_url && (
                  <Image
                    src={item.cover_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    priority={i === 0}
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wide mb-1.5", STATUS_COLORS[item.status])}>
                    {item.status === "ongoing" ? "Baru Update" : STATUS_LABELS[item.status]}
                  </span>
                  <h2 className="font-display text-xl font-bold text-white leading-tight mb-1 drop-shadow">
                    {item.title}
                  </h2>
                  {item.chapters[0] && (
                    <p className="text-white/70 text-xs">
                      Chapter {item.chapters[0].number} · {formatDate(item.chapters[0].created_at)}
                    </p>
                  )}
                </div>
              </Link>
            ))}

            {/* Nav arrows */}
            {bannerItems.length > 1 && (
              <>
                <button onClick={prevBanner} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextBanner} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dots */}
            {bannerItems.length > 1 && (
              <div className="absolute bottom-3 right-4 flex gap-1">
                {bannerItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentBanner(i); resetAuto(); }}
                    className={cn(
                      "rounded-full transition-all",
                      i === currentBanner ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANHWA GRID */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {hasFilter && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {manhwaList.length} hasil{q ? ` untuk "${q}"` : ""}
            </p>
            <button onClick={() => { setQ(""); setStatus(""); setGenre(""); router.push("/"); }} className="text-xs text-red-500 hover:underline">
              Reset filter
            </button>
          </div>
        )}

        {!hasFilter && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-gray-900">
              {status ? STATUS_LABELS[status as ManhwaStatus] : "Semua Manhwa"}
            </h2>
            <p className="text-xs text-gray-400">{manhwaList.length} judul</p>
          </div>
        )}

        {manhwaList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-700">{q ? `Tidak ada hasil untuk "${q}"` : "Belum ada manhwa"}</p>
            <p className="text-sm text-gray-400 mt-1">{q ? "Coba kata kunci lain" : "Manhwa akan muncul di sini"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {manhwaList.map((manhwa) => (
              <ManhwaGridCard key={manhwa.id} manhwa={manhwa} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 sm:hidden">
        <div className="max-w-2xl mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center py-2 text-red-500">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-semibold">Beranda</span>
          </Link>
          <button
            onClick={() => setShowSearch(true)}
            className="flex-1 flex flex-col items-center py-2 text-gray-400"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cari</span>
          </button>
        </div>
      </nav>
      <div className="h-16 sm:hidden" />
    </div>
  );
}

function ManhwaGridCard({ manhwa }: { manhwa: ManhwaWithLatestChapter }) {
  const latestChapter = manhwa.chapters?.[0];
  return (
    <Link href={`/manhwa/${manhwa.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 mb-1.5 shadow-sm group-hover:shadow-md transition-shadow">
        {manhwa.cover_url ? (
          <Image
            src={manhwa.cover_url}
            alt={manhwa.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {latestChapter && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1.5">
            <p className="text-[10px] text-white font-semibold">Ch.{latestChapter.number}</p>
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">
        {manhwa.title}
      </p>
    </Link>
  );
}
