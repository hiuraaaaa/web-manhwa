import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import { DeleteChapterButton } from "@/components/admin/DeleteChapterButton";
import { formatChapterNumber, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChaptersPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: manhwa } = await supabase.from("manhwa").select("id, title, slug").eq("id", id).single();
  if (!manhwa) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, number, title, created_at")
    .eq("manhwa_id", id)
    .order("number", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted mb-0.5">
            <Link href="/admin/manhwa" className="hover:text-accent transition-colors">Manhwa</Link>
            {" / "}
            <Link href={`/admin/manhwa/${id}/edit`} className="hover:text-accent transition-colors">{manhwa.title}</Link>
          </p>
          <h1 className="font-display text-xl font-semibold text-text-primary">Chapter</h1>
          <p className="text-sm text-text-secondary mt-0.5">{chapters?.length ?? 0} chapter</p>
        </div>
        <Link
          href={`/admin/manhwa/${id}/chapters/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Upload Chapter
        </Link>
      </div>

      {!chapters || chapters.length === 0 ? (
        <EmptyState
          title="Belum ada chapter"
          description="Upload chapter pertama untuk manhwa ini"
          action={
            <Link href={`/admin/manhwa/${id}/chapters/new`} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-lg">
              <Plus className="w-4 h-4" /> Upload Chapter
            </Link>
          }
        />
      ) : (
        <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
          {chapters.map((ch, i) => (
            <div key={ch.id} className={`flex items-center justify-between px-4 py-3 ${i !== 0 ? "border-t border-bg-border" : ""}`}>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {formatChapterNumber(ch.number)}
                </p>
                {ch.title && <p className="text-xs text-text-muted mt-0.5">{ch.title}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">{formatDate(ch.created_at)}</span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/manhwa/${manhwa.slug}/chapter/${ch.number}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors text-xs"
                    title="Preview"
                  >
                    ↗
                  </Link>
                  <DeleteChapterButton chapterId={ch.id} chapterNum={ch.number} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
