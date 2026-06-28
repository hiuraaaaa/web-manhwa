import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/Navbar";
import { Badge } from "@/components/ui";
import { STATUS_LABELS, ManhwaStatus } from "@/lib/types";
import { formatChapterNumber, formatDate } from "@/lib/utils";
import { BookOpen, Clock, User, Pen } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Detail header */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="relative w-40 sm:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-bg-elevated mx-auto sm:mx-0">
              {manhwa.cover_url ? (
                <Image src={manhwa.cover_url} alt={manhwa.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <BookOpen className="w-10 h-10" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={manhwa.status as ManhwaStatus}>{STATUS_LABELS[manhwa.status as ManhwaStatus]}</Badge>
              {manhwa.genres?.map((g: string) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary mb-3">
              {manhwa.title}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
              {manhwa.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {manhwa.author}
                </span>
              )}
              {manhwa.artist && (
                <span className="flex items-center gap-1.5">
                  <Pen className="w-4 h-4" /> {manhwa.artist}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {chapters?.length || 0} Chapter
              </span>
            </div>
            {manhwa.synopsis && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {manhwa.synopsis}
              </p>
            )}
            {chapters && chapters.length > 0 && (
              <Link
                href={`/manhwa/${slug}/chapter/${chapters[chapters.length - 1].number}`}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Mulai Baca
              </Link>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4">Daftar Chapter</h2>
          {!chapters || chapters.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">Belum ada chapter</div>
          ) : (
            <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
              {chapters.map((chapter, i) => (
                <Link
                  key={chapter.id}
                  href={`/manhwa/${slug}/chapter/${chapter.number}`}
                  className={`flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors group ${i !== 0 ? "border-t border-bg-border" : ""}`}
                >
                  <div>
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                      {formatChapterNumber(chapter.number)}
                    </span>
                    {chapter.title && (
                      <span className="text-sm text-text-secondary ml-2">— {chapter.title}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {formatDate(chapter.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
