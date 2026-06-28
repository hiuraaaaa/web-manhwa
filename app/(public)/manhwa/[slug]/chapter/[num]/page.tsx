import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { formatChapterNumber } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string; num: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, num } = await params;
  return { title: `${formatChapterNumber(Number(num))} — ${slug}` };
}

export default async function ChapterReaderPage({ params }: Props) {
  const { slug, num } = await params;
  const chapterNum = Number(num);
  if (isNaN(chapterNum)) notFound();

  const supabase = await createClient();

  // Get manhwa
  const { data: manhwa } = await supabase
    .from("manhwa")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!manhwa) notFound();

  // Get this chapter with pages
  const { data: chapter } = await supabase
    .from("chapters")
    .select("*, pages(id, page_number, image_url)")
    .eq("manhwa_id", manhwa.id)
    .eq("number", chapterNum)
    .single();

  if (!chapter) notFound();

  const pages = (chapter.pages as { id: string; page_number: number; image_url: string }[])
    .sort((a, b) => a.page_number - b.page_number);

  // Get adjacent chapters
  const { data: allChapters } = await supabase
    .from("chapters")
    .select("number")
    .eq("manhwa_id", manhwa.id)
    .order("number", { ascending: true });

  const numbers = (allChapters || []).map((c) => c.number);
  const currentIdx = numbers.indexOf(chapterNum);
  const prevNum = currentIdx > 0 ? numbers[currentIdx - 1] : null;
  const nextNum = currentIdx < numbers.length - 1 ? numbers[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-bg-base/90 backdrop-blur-md border-b border-bg-border">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <Link href={`/manhwa/${slug}`} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors min-w-0">
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm truncate">{manhwa.title}</span>
          </Link>
          <span className="text-sm font-medium text-text-primary flex-shrink-0">
            {formatChapterNumber(chapterNum)}
          </span>
          <div className="flex items-center gap-1">
            {prevNum !== null ? (
              <Link href={`/manhwa/${slug}/chapter/${prevNum}`} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : <span className="p-1.5 w-8" />}
            {nextNum !== null ? (
              <Link href={`/manhwa/${slug}/chapter/${nextNum}`} className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : <span className="p-1.5 w-8" />}
          </div>
        </div>
      </div>

      {/* Pages — vertical scroll */}
      <div className="max-w-3xl mx-auto">
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-text-muted text-sm">
            Halaman belum tersedia
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="relative w-full">
              <Image
                src={page.image_url}
                alt={`Halaman ${page.page_number}`}
                width={900}
                height={1400}
                className="w-full h-auto block"
                priority={page.page_number <= 3}
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <div className="sticky bottom-0 bg-bg-base/90 backdrop-blur-md border-t border-bg-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {prevNum !== null ? (
            <Link href={`/manhwa/${slug}/chapter/${prevNum}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated text-sm text-text-secondary hover:text-text-primary hover:bg-bg-border transition-colors">
              <ChevronLeft className="w-4 h-4" /> Ch. {prevNum}
            </Link>
          ) : <span />}

          <ReaderControls manhwaSlug={slug} chapterNumber={chapterNum} manhwaTitle={manhwa.title} />

          {nextNum !== null ? (
            <Link href={`/manhwa/${slug}/chapter/${nextNum}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-sm text-white transition-colors">
              Ch. {nextNum} <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link href={`/manhwa/${slug}`} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated text-sm text-text-secondary hover:text-text-primary transition-colors">
              Selesai
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
