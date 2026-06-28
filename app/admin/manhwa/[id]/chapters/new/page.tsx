import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChapterUploadForm } from "@/components/admin/ChapterUploadForm";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewChapterPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: manhwa } = await supabase.from("manhwa").select("id, title, slug").eq("id", id).single();
  if (!manhwa) notFound();

  // Get existing chapter numbers to suggest next
  const { data: chapters } = await supabase
    .from("chapters")
    .select("number")
    .eq("manhwa_id", id)
    .order("number", { ascending: false })
    .limit(1);

  const nextChapterNum = chapters && chapters.length > 0 ? chapters[0].number + 1 : 1;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-text-muted mb-0.5">
          <Link href="/admin/manhwa" className="hover:text-accent transition-colors">Manhwa</Link>
          {" / "}
          <Link href={`/admin/manhwa/${id}/chapters`} className="hover:text-accent transition-colors">{manhwa.title}</Link>
          {" / Upload"}
        </p>
        <h1 className="font-display text-xl font-semibold text-text-primary">Upload Chapter</h1>
      </div>
      <ChapterUploadForm manhwaId={id} manhwaSlug={manhwa.slug} suggestedNumber={nextChapterNum} />
    </div>
  );
}
