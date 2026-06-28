import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/Navbar";
import { ManhwaCard } from "@/components/ui/ManhwaCard";
import { EmptyState } from "@/components/ui";
import { ManhwaWithLatestChapter, ManhwaStatus } from "@/lib/types";
import { SearchBar } from "@/components/ui/SearchBar";

interface HomePageProps {
  searchParams: Promise<{ q?: string; genre?: string; status?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, genre, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("manhwa")
    .select(`
      *,
      chapters (
        id, number, title, created_at
      )
    `)
    .order("updated_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (genre) {
    query = query.contains("genres", [genre]);
  }
  if (status && ["ongoing", "completed", "hiatus"].includes(status)) {
    query = query.eq("status", status as ManhwaStatus);
  }

  const { data: manhwaList } = await query;

  // For each manhwa, keep only latest chapter
  const processed: ManhwaWithLatestChapter[] = (manhwaList || []).map((m) => ({
    ...m,
    chapters: m.chapters
      .sort((a: { number: number }, b: { number: number }) => b.number - a.number)
      .slice(0, 1),
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
            Manhwa Terjemahan
          </h1>
          <p className="text-text-secondary text-sm">
            Koleksi manhwa yang gua terjemahin sendiri ke Bahasa Indonesia
          </p>
        </div>

        {/* Search & Filter */}
        <SearchBar defaultQuery={q} defaultStatus={status} defaultGenre={genre} />

        {/* Grid */}
        <div className="mt-6">
          {processed.length === 0 ? (
            <EmptyState
              title={q ? `Tidak ada hasil untuk "${q}"` : "Belum ada manhwa"}
              description={q ? "Coba kata kunci lain" : "Manhwa akan muncul di sini setelah diupload"}
            />
          ) : (
            <>
              <p className="text-xs text-text-muted mb-4">{processed.length} manhwa</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {processed.map((manhwa) => (
                  <ManhwaCard key={manhwa.id} manhwa={manhwa} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
