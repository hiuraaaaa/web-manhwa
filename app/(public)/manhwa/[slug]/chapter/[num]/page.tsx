import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { formatChapterNumber } from "@/lib/utils";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
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

  const { data: manhwa } = await supabase
    .from("manhwa")
    .select("id, title, slug")
    .eq("slug", slug)
    .single();

  if (!manhwa) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("*, pages(id, page_number, image_url)")
    .eq("manhwa_id", manhwa.id)
    .eq("number", chapterNum)
    .single();

  if (!chapter) notFound();

  const pages = (chapter.pages as { id: string; page_number: number; image_url: string }[])
    .sort((a, b) => a.page_number - b.page_number);

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
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-3 h-12 flex items-center gap-2">
          {/* Back to manhwa */}
          <Link
            href={`/manhwa/${slug}`}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>

          {/* Title + chapter */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 leading-none truncate">{manhwa.title}</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {formatChapterNumber(chapterNum)}
            </p>
          </div>

          {/* Chapter nav */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {prevNum !== null ? (
              <Link
                href={`/manhwa/${slug}/chapter/${prevNum}`}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Chapter sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </Link>
            ) : <span className="w-7" />}

            <Link
              href={`/manhwa/${slug}`}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              title="Daftar chapter"
            >
              <List className="w-4 h-4 text-gray-600" />
            </Link>

            {nextNum !== null ? (
              <Link
                href={`/manhwa/${slug}/chapter/${nextNum}`}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                title="Chapter selanjutnya"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Link>
            ) : <span className="w-7" />}
          </div>
        </div>
      </header>

      {/* Pages — vertical scroll */}
      <div className="max-w-2xl mx-auto">
        {pages.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
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

      {/* Bottom nav bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Prev */}
          {prevNum !== null ? (
            <Link
              href={`/manhwa/${slug}/chapter/${prevNum}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Ch. {prevNum}
            </Link>
          ) : (
            <Link
              href={`/manhwa/${slug}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Detail
            </Link>
          )}

          {/* Bookmark */}
          <ReaderControls manhwaSlug={slug} chapterNumber={chapterNum} manhwaTitle={manhwa.title} />

          {/* Next */}
          {nextNum !== null ? (
            <Link
              href={`/manhwa/${slug}/chapter/${nextNum}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors"
            >
              Ch. {nextNum} <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/manhwa/${slug}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              Selesai <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
