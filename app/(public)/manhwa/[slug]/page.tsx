import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { STATUS_LABELS, ManhwaStatus } from "@/lib/types";
import { formatChapterNumber, formatDate } from "@/lib/utils";
import { BookOpen, Clock, User, Pen, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("manhwa").select("title, synopsis").eq("slug", slug).single();
  if (!data) return { title: "Not Found" };
  return { title: data.title, description: data.synopsis || undefined };
}

const STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  hiatus: "bg-amber-100 text-amber-700",
};

export default async function ManhwaDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: manhwa } = await supabase
    .from("manhwa")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!manhwa) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, number, title, created_at")
    .eq("manhwa_id", manhwa.id)
    .order("number", { ascending: false });

  const firstChapter = chapters?.[chapters.length - 1];
  const latestChapter = chapters?.[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-13 py-2.5 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="font-display font-bold text-base text-gray-900 truncate flex-1">{manhwa.title}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Hero section */}
        <div className="relative">
          {/* Blurred background */}
          {manhwa.cover_url && (
            <div className="absolute inset-0 overflow-hidden h-56">
              <Image src={manhwa.cover_url} alt="" fill className="object-cover blur-xl scale-110 opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white" />
            </div>
          )}

          <div className="relative px-4 pt-6 pb-4 flex gap-4">
            {/* Cover */}
            <div className="flex-shrink-0">
              <div className="relative w-28 aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-gray-100">
                {manhwa.cover_url ? (
                  <Image src={manhwa.cover_url} alt={manhwa.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h2 className="font-display text-lg font-bold text-gray-900 leading-tight mb-1.5">
                {manhwa.title}
              </h2>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_COLORS[manhwa.status]}`}>
                  {STATUS_LABELS[manhwa.status as ManhwaStatus]}
                </span>
                {manhwa.genres?.slice(0, 2).map((g: string) => (
                  <span key={g} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    {g}
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                {manhwa.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {manhwa.author}
                  </span>
                )}
                {manhwa.artist && (
                  <span className="flex items-center gap-1">
                    <Pen className="w-3 h-3" /> {manhwa.artist}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {chapters?.length || 0} Chapter
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        {chapters && chapters.length > 0 && (
          <div className="px-4 pb-4 flex gap-2">
            <Link
              href={`/manhwa/${slug}/chapter/${firstChapter?.number}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Play className="w-4 h-4 fill-white" /> Mulai Baca
            </Link>
            <Link
              href={`/manhwa/${slug}/chapter/${latestChapter?.number}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" /> Ch. Terbaru
            </Link>
          </div>
        )}

        {/* Synopsis */}
        {manhwa.synopsis && (
          <div className="px-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-sm text-gray-900 mb-2">Sinopsis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{manhwa.synopsis}</p>
            </div>
          </div>
        )}

        {/* Genres */}
        {manhwa.genres?.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-1.5">
              {manhwa.genres.map((g: string) => (
                <span key={g} className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Chapter list */}
        <div className="px-4 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base text-gray-900">
              Daftar Chapter
            </h3>
            <span className="text-xs text-gray-400">{chapters?.length || 0} chapter</span>
          </div>

          {!chapters || chapters.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Belum ada chapter</div>
          ) : (
            <div className="flex flex-col gap-0 border border-gray-100 rounded-xl overflow-hidden">
              {chapters.map((chapter, i) => (
                <Link
                  key={chapter.id}
                  href={`/manhwa/${slug}/chapter/${chapter.number}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-red-50 transition-colors group ${i !== 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-red-500 transition-colors">
                      {formatChapterNumber(chapter.number)}
                    </p>
                    {chapter.title && (
                      <p className="text-xs text-gray-400 mt-0.5">{chapter.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDate(chapter.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
