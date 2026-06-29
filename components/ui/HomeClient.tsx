"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, X, Home, Search, Bookmark, Grid } from "lucide-react";
import { ManhwaWithLatestChapter, STATUS_LABELS, ManhwaStatus, GENRES } from "@/lib/types";
import { cn, formatDate, getBookmarks } from "@/lib/utils";

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

function ManhwaCard({ manhwa }: { manhwa: ManhwaWithLatestChapter }) {
  const latest = manhwa.chapters?.[0];
  return (
    <Link href={`/manhwa/${manhwa.slug}`} className="group min-w-[110px] w-[110px] flex flex-col gap-1.5 flex-shrink-0 snap-start">
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

function HorizontalSection({ title, subtitle, items, href }: {
  title: string;
  subtitle: string;
  items: ManhwaWithLatestChapter[];
  href?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -250 : 250, behavior: "smooth" });
  }
  return (
    <section className="mt-7">
      <div className="flex items-center justify-between mb-3">
        <div>
          {href ? (
            <Link href={href} className="group flex items-center gap-0.5">
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
        {items.map(m => <ManhwaCard key={m.id} manhwa={m} />)}
      </div>
    </section>
  );
}

export function HomeClient({ manhwaList, bannerItems, defaultQ = "", defaultStatus = "", defaultGenre = "" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [heroIndex, setHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [q, setQ] = useState(defaultQ);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showGenre, setShowGenre] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [liveResults, setLiveResults] = useState<ManhwaWithLatestChapter[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carouselItems = bannerItems.length > 0 ? [...bannerItems, bannerItems[0]] : [];

  useEffect(() => {
    const bms = getBookmarks();
    setBookmarkCount(Object.keys(bms).length);
  }, []);

  // Auto advance banner
  useEffect(() => {
    if (bannerItems.length <= 1) return;
    autoRef.current = setInterval(() => setHeroIndex(p => p + 1), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [bannerItems.length]);

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

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 300);
    else { setQ(""); setLiveResults([]); }
  }, [searchOpen]);

  // Live search debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length > 1) {
      searchTimer.current = setTimeout(() => {
        const results = manhwaList.filter(m =>
          m.title.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 6);
        setLiveResults(results);
      }, 300);
    } else {
      setLiveResults([]);
    }
  }, [q, manhwaList]);

  function resetAuto() {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setHeroIndex(p => p + 1), 5000);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  }

  const ongoing = manhwaList.filter(m => m.status === "ongoing");
  const completed = manhwaList.filter(m => m.status === "completed");
  const hasFilter = defaultQ || defaultStatus || defaultGenre;

  const bookmarks = getBookmarks();
  const bookmarkedManhwa = Object.values(bookmarks);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* NAVBAR — floating pill style */}
      <div className="sticky top-3 z-50 px-4 max-w-2xl mx-auto">
        <div className="relative bg-white/90 backdrop-blur-md h-14 px-5 rounded-2xl flex items-center justify-between border border-gray-200 shadow-lg overflow-hidden">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 font-display font-bold text-gray-900 z-10">
            <BookOpen className="w-5 h-5 text-red-500" strokeWidth={2.5} />
            ManhwaKu
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200 transition-colors"
            >
              <Search className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Search overlay inside navbar */}
          <div className={cn(
            "absolute inset-0 bg-white z-20 flex items-center px-4 transition-all duration-300",
            searchOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
          )}>
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
              <button type="submit" className="text-red-500 shrink-0">
                <Search className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari manhwa..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className="flex-1 bg-transparent text-gray-900 text-sm font-semibold outline-none placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Live search results */}
        {searchOpen && q.length > 1 && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
            {liveResults.length > 0 ? (
              liveResults.map(m => (
                <Link
                  key={m.id}
                  href={`/manhwa/${m.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {m.cover_url && (
                    <div className="relative w-8 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={m.cover_url} alt="" fill className="object-cover" sizes="32px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{m.chapters?.length ?? 0} chapter · {STATUS_LABELS[m.status as ManhwaStatus]}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400 font-medium">Tidak ditemukan</div>
            )}
            <button
              onClick={() => { router.push(`/?q=${encodeURIComponent(q)}`); setSearchOpen(false); }}
              className="w-full px-4 py-3 text-center text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              Lihat semua hasil untuk "{q}"
            </button>
          </div>
        )}
      </div>

      {/* Genre sheet */}
      {showGenre && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowGenre(false)} />
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-t-3xl p-5 pb-24 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-gray-900">Genre</h3>
              <button onClick={() => setShowGenre(false)} className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <Link
                  key={g}
                  href={`/?genre=${encodeURIComponent(g)}`}
                  onClick={() => setShowGenre(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                    defaultGenre === g
                      ? "bg-red-500 border-red-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 bg-white"
                  )}
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH / FILTER RESULTS */}
      {hasFilter ? (
        <main className="max-w-2xl mx-auto px-4 pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">
              {manhwaList.length} hasil
              {defaultQ ? ` untuk "${defaultQ}"` : ""}
              {defaultStatus ? ` · ${STATUS_LABELS[defaultStatus as ManhwaStatus]}` : ""}
              {defaultGenre ? ` · ${defaultGenre}` : ""}
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
            <div className="max-w-2xl mx-auto mt-3 px-4">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                <div
                  className={cn("flex", isTransitioning ? "transition-transform duration-700" : "")}
                  style={{ transform: `translate3d(-${heroIndex * 100}%, 0, 0)` }}
                >
                  {carouselItems.map((item, i) => (
                    <Link key={i} href={`/manhwa/${item.slug}`} className="min-w-full relative aspect-[16/9] sm:aspect-[21/9] block">
                      {item.cover_url && (
                        <Image src={item.cover_url} alt={item.title} fill className="object-cover" priority={i === 0} sizes="768px" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-3">
                        {item.cover_url && (
                          <div className="relative w-12 aspect-[3/4] rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                            <Image src={item.cover_url} alt="" fill className="object-cover" sizes="48px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-[9px] font-bold text-white mb-1",
                            item.status === "ongoing" ? "bg-emerald-500" : item.status === "completed" ? "bg-blue-500" : "bg-amber-500"
                          )}>
                            {STATUS_LABELS[item.status as ManhwaStatus].toUpperCase()}
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

                {bannerItems.length > 1 && (
                  <>
                    <button onClick={() => { setHeroIndex(p => p === 0 ? bannerItems.length - 1 : p - 1); resetAuto(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setHeroIndex(p => p + 1); resetAuto(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                      {bannerItems.map((_, i) => (
                        <button key={i} onClick={() => { setHeroIndex(i); resetAuto(); }}
                          className={cn("rounded-full transition-all", i === (heroIndex % bannerItems.length) ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40")}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <main className="max-w-2xl mx-auto px-4">
            <HorizontalSection title="Baru Update" subtitle="Chapter terbaru" items={manhwaList.slice(0, 12)} />
            {ongoing.length > 0 && <HorizontalSection title="Ongoing" subtitle={`${ongoing.length} manhwa`} items={ongoing} href="/?status=ongoing" />}
            {completed.length > 0 && <HorizontalSection title="Completed" subtitle={`${completed.length} manhwa tamat`} items={completed} href="/?status=completed" />}

            {/* All grid */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-display font-bold text-base text-gray-900">Semua Manhwa</h2>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Koleksi lengkap · {manhwaList.length} judul</p>
                </div>
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

      {/* BOTTOM NAV — floating pill */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
        <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-full flex justify-between items-center px-6 py-3 shadow-xl">
          {[
            { icon: Home, label: "Beranda", href: "/", active: pathname === "/" && !hasFilter },
            { icon: Search, label: "Cari", href: null, onClick: () => setSearchOpen(true), active: searchOpen },
            { icon: Bookmark, label: "Lanjut", href: "/bookmarks", active: pathname === "/bookmarks", badge: bookmarkCount },
            { icon: Grid, label: "Genre", href: null, onClick: () => setShowGenre(true), active: showGenre },
          ].map((item, i) => (
            item.href ? (
              <Link key={i} href={item.href} className={cn("flex flex-col items-center gap-1 transition-colors", item.active ? "text-red-500" : "text-gray-400 hover:text-gray-700")}>
                <div className={cn("p-1.5 rounded-full transition-colors relative", item.active ? "bg-red-50" : "")}>
                  <item.icon className="w-5 h-5" strokeWidth={2.5} />
                  {item.badge ? (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{item.badge}</span>
                  ) : null}
                </div>
                <span className={cn("text-[9px] font-bold transition-all", item.active ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>{item.label}</span>
              </Link>
            ) : (
              <button key={i} onClick={item.onClick} className={cn("flex flex-col items-center gap-1 transition-colors", item.active ? "text-red-500" : "text-gray-400 hover:text-gray-700")}>
                <div className={cn("p-1.5 rounded-full transition-colors", item.active ? "bg-red-50" : "")}>
                  <item.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className={cn("text-[9px] font-bold transition-all", item.active ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
