"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, BookOpen, X, Play } from "lucide-react";
import { ManhwaWithLatestChapter, STATUS_LABELS, ManhwaStatus, GENRES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface Props {
  manhwaList: ManhwaWithLatestChapter[];
  bannerItems: ManhwaWithLatestChapter[];
  defaultQ?: string;
  defaultStatus?: string;
  defaultGenre?: string;
}

const STATUS_DOT: Record<string, string> = {
  ongoing: "bg-emerald-500",
  completed: "bg-blue-500",
  hiatus: "bg-amber-500",
};

const STATUS_BADGE: Record<string, string> = {
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  hiatus: "bg-amber-100 text-amber-700",
};

function ManhwaCard({ manhwa }: { manhwa: ManhwaWithLatestChapter }) {
  const latest = manhwa.chapters?.[0];
  return (
    <Link href={`/manhwa/${manhwa.slug}`} className="group min-w-[110px] w-[110px] flex flex-col gap-1.5 flex-shrink-0">
      <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
        {manhwa.cover_url ? (
          <Image src={manhwa.cover_url} alt={manhwa.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="120px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {latest && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
            <p className="text-[10px] text-white font-bold">Ch.{latest.number}</p>
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{manhwa.title}</p>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="min-w-[110px] w-[110px] flex flex-col gap-1.5 flex-shrink-0">
      <div className="aspect-[3/4.2] rounded-xl bg-gray-100 animate-pulse" />
      <div className="h-2.5 w-3/4 bg-gray-100 rounded animate-pulse" />
      <div className="h-2.5 w-1/2 bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-100 animate-pulse flex items-end p-5 gap-4">
      <div className="w-20 aspect-[3/4] rounded-xl bg-gray-200" />
      <div className="flex flex-col gap-2 flex-1 pb-2">
        <div className="h-6 w-2/3 bg-gray-200 rounded" />
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function HomeClient({ manhwaList, bannerItems, defaultQ = "", defaultStatus = "", defaultGenre = "" }: Props) {
  const router = useRouter();
  const [heroIndex, setHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [q, setQ] = useState(defaultQ);
  const [showSearch, setShowSearch] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const carouselItems = bannerItems.length > 0 ? [...bannerItems, bannerItems[0]] : [];

  // Auto advance
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    autoRef.current = setInterval(() => setHeroIndex(p => p + 1), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [bannerItems.length]);

  // Reset to 0 after last fake slide
  useEffect(() => {
    if (bannerItems.length > 0 && heroIndex === bannerItems.length) {
      const t = setTimeout(() => { setIsTransitioning(false); setHeroIndex(0); }, 700);
      return () => clearTimeout(t);
    }
  }, [heroIndex, bannerItems.length]);

  useEffect(() => {
    if (!isTransitioning && heroIndex === 0) {
      const t = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(t);
    }
  }, [isTransitioning, heroIndex]);

  function resetAuto() {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setHeroIndex(p => p + 1), 5000);
  }

  function nextHero() { setHeroIndex(p => p + 1); resetAuto(); }
  function prevHero() {
    setHeroIndex(p => p === 0 ? bannerItems.length - 1 : p - 1);
    resetAuto();
  }

  function handleSearch() {
    if (q.trim()) router.push(`/?q=${encodeURIComponent(q)}`);
    else router.push("/");
  }

  // Sections
  const ongoing = manhwaList.filter(m => m.status === "ongoing");
  const completed = manhwaList.filter(m => m.status === "completed");
  const latest = [...manhwaList].slice(0, 12);

  const hasFilter = defaultQ || defaultStatus || defaultGenre;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 font-display font-bold text-lg text-gray-900 flex-shrink-0">
            <BookOpen className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            ManhwaKu
          </Link>

          {/* Desktop search */}
          <div className="hidden sm:flex flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari manhwa..."
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-gray-200 transition-colors"
            />
            {q && <button onClick={() => { setQ(""); router.push("/"); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
          </div>

          <button className="sm:hidden ml-auto p-1.5 rounded-full hover:bg-gray-100" onClick={() => setShowSearch(s => !s)}>
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="sm:hidden px-4 pb-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Cari manhwa..."
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Filter pills */}
        {!hasFilter && (
          <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
            {(["ongoing", "completed", "hiatus"] as ManhwaStatus[]).map(s => (
              <Link key={s} href={`/?status=${s}`}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors bg-white"
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[s])} />
                {STATUS_LABELS[s]}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* SEARCH RESULTS */}
      {hasFilter ? (
        <main className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">
              {manhwaList.length} hasil{defaultQ ? ` untuk "${defaultQ}"` : ""}
              {defaultStatus ? ` · ${STATUS_LABELS[defaultStatus as ManhwaStatus]}` : ""}
            </p>
            <Link href="/" className="text-xs text-red-500 hover:underline">Reset</Link>
          </div>
          {manhwaList.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-semibold text-gray-700">Tidak ada hasil</p>
              <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {manhwaList.map(m => (
                <Link key={m.id} href={`/manhwa/${m.slug}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-1.5 shadow-sm">
                    {m.cover_url ? <Image src={m.cover_url} alt={m.title} fill className="object-cover" sizes="150px" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-300" /></div>}
                    {m.chapters[0] && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5"><p className="text-[10px] text-white font-bold">Ch.{m.chapters[0].number}</p></div>}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 group-hover:text-red-500 transition-colors">{m.title}</p>
                </Link>
              ))}
            </div>
          )}
        </main>
      ) : (
        <>
          {/* HERO BANNER */}
          {bannerItems.length > 0 && (
            <div className="max-w-2xl mx-auto relative overflow-hidden bg-gray-100">
              <div
                className={cn("flex h-full", isTransitioning ? "transition-transform duration-700" : "")}
                style={{ transform: `translate3d(-${heroIndex * 100}%, 0, 0)` }}
              >
                {carouselItems.map((item, i) => (
                  <Link key={i} href={`/manhwa/${item.slug}`} className="min-w-full relative aspect-[16/9] sm:aspect-[21/9] block overflow-hidden bg-gray-200">
                    {item.cover_url && (
                      <Image src={item.cover_url} alt={item.title} fill className="object-cover" priority={i === 0} sizes="768px" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                      {item.cover_url && (
                        <div className="relative w-14 aspect-[3/4] rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                          <Image src={item.cover_url} alt="" fill className="object-cover" sizes="60px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pb-0.5">
                        <span className={cn("inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1", item.status === "ongoing" ? "bg-emerald-500" : item.status === "completed" ? "bg-blue-500" : "bg-amber-500")}>
                          {item.status === "ongoing" ? "ONGOING" : STATUS_LABELS[item.status]}
                        </span>
                        <h2 className="font-display font-bold text-white text-base leading-tight line-clamp-2 drop-shadow">{item.title}</h2>
                        {item.chapters[0] && (
                          <p className="text-white/60 text-[10px] mt-0.5">Ch. {item.chapters[0].number} · {formatDate(item.chapters[0].created_at)}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Arrows */}
              {bannerItems.length > 1 && (
                <>
                  <button onClick={prevHero} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextHero} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Dots */}
              {bannerItems.length > 1 && (
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                  {bannerItems.map((_, i) => (
                    <button key={i} onClick={() => { setHeroIndex(i); resetAuto(); }}
                      className={cn("rounded-full transition-all", i === (heroIndex % bannerItems.length) ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40")}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <main className="max-w-2xl mx-auto px-4">
            {/* Baru Update */}
            <HorizontalSection title="Baru Update" subtitle="Chapter terbaru" items={latest} />

            {/* Ongoing */}
            {ongoing.length > 0 && (
              <HorizontalSection title="Ongoing" subtitle={`${ongoing.length} manhwa masih berjalan`} items={ongoing} statusHref="/?status=ongoing" />
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <HorizontalSection title="Completed" subtitle={`${completed.length} manhwa tamat`} items={completed} statusHref="/?status=completed" />
            )}

            {/* All grid */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display font-bold text-base text-gray-900">Semua Manhwa</h2>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Koleksi lengkap</p>
                </div>
                <p className="text-xs text-gray-400">{manhwaList.length} judul</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {manhwaList.map(m => (
                  <Link key={m.id} href={`/manhwa/${m.slug}`} className="group block">
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-1.5 shadow-sm group-hover:shadow-md transition-shadow">
                      {m.cover_url ? <Image src={m.cover_url} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="150px" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-300" /></div>}
                      <div className="absolute top-1.5 left-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full block", STATUS_DOT[m.status])} />
                      </div>
                      {m.chapters[0] && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5"><p className="text-[10px] text-white font-bold">Ch.{m.chapters[0].number}</p></div>}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-red-500 transition-colors">{m.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 sm:hidden">
        <div className="max-w-2xl mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center py-2.5 text-red-500">
            <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-[10px] mt-0.5 font-bold">Beranda</span>
          </Link>
          <button onClick={() => setShowSearch(s => !s)} className="flex-1 flex flex-col items-center py-2.5 text-gray-400">
            <Search className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Cari</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function HorizontalSection({ title, subtitle, items, statusHref }: {
  title: string;
  subtitle: string;
  items: ManhwaWithLatestChapter[];
  statusHref?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }

  return (
    <section className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col">
          {statusHref ? (
            <Link href={statusHref} className="group flex items-center gap-1">
              <h2 className="font-display font-bold text-base text-gray-900 group-hover:text-red-500 transition-colors">{title}</h2>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
            </Link>
          ) : (
            <h2 className="font-display font-bold text-base text-gray-900">{title}</h2>
          )}
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => scroll("left")} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button onClick={() => scroll("right")} className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex overflow-x-auto gap-3 pb-2 scrollbar-none snap-x">
        {items.map(m => (
          <div key={m.id} className="snap-start">
            <ManhwaCard manhwa={m} />
          </div>
        ))}
      </div>
    </section>
  );
}
