"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

interface Props {
  manhwaId: string;
  manhwaTitle: string;
}

export function DeleteManhwaButton({ manhwaId, manhwaTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Hapus "${manhwaTitle}"? Semua chapter dan halaman akan ikut terhapus.`)) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("manhwa").delete().eq("id", manhwaId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
      title="Hapus manhwa"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
