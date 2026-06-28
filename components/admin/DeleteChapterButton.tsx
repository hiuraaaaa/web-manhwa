"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

interface Props {
  chapterId: string;
  chapterNum: number;
}

export function DeleteChapterButton({ chapterId, chapterNum }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus Chapter ${chapterNum}?`)) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("chapters").delete().eq("id", chapterId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
      title="Hapus chapter"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
