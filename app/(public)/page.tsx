import { createClient } from "@/lib/supabase/server";
import { ManhwaWithLatestChapter, ManhwaStatus } from "@/lib/types";
import { HomeClient } from "@/components/ui/HomeClient";

interface HomePageProps {
  searchParams: Promise<{ q?: string; genre?: string; status?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { q, genre, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("manhwa")
    .select(`*, chapters (id, number, title, created_at)`)
    .order("updated_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (genre) query = query.contains("genres", [genre]);
  if (status && ["ongoing", "completed", "hiatus"].includes(status)) {
    query = query.eq("status", status as ManhwaStatus);
  }

  const { data: manhwaList } = await query;

  const processed: ManhwaWithLatestChapter[] = (manhwaList || []).map((m) => ({
    ...m,
    chapters: m.chapters
      .sort((a: { number: number }, b: { number: number }) => b.number - a.number)
      .slice(0, 1),
  }));

  // Top 5 for banner (latest updated with cover)
  const bannerItems = processed.filter((m) => m.cover_url).slice(0, 5);

  return <HomeClient manhwaList={processed} bannerItems={bannerItems} defaultQ={q} defaultStatus={status} defaultGenre={genre} />;
}
