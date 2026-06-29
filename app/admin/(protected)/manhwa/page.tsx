import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, BookOpen, ChevronRight } from "lucide-react";
import { STATUS_LABELS, ManhwaStatus } from "@/lib/types";
import { DeleteManhwaButton } from "@/components/admin/DeleteManhwaButton";

const STATUS_COLORS: Record<string, string> = {
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  hiatus: "bg-amber-100 text-amber-700",
};

export default async function AdminManhwaPage() {
  const supabase = await createClient();

  const { data: manhwaList } = await supabase
    .from("manhwa")
    .select("*, chapters(id)")
    .order("updated_at", { ascending: false });

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manhwa</h1>
          <p className="text-sm text-gray-400 mt-0.5">{manhwaList?.length ?? 0} judul</p>
        </div>
        <Link
          href="/admin/manhwa/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah
        </Link>
      </div>

      {!manhwaList || manhwaList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <BookOpen className="w-7 h-7 text-red-400" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Belum ada manhwa</p>
          <p className="text-sm text-gray-400 mb-4">Mulai dengan menambahkan manhwa pertama</p>
          <Link href="/admin/manhwa/new" className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-xl font-semibold">
            <Plus className="w-4 h-4" /> Tambah Manhwa
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {manhwaList.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${i !== 0 ? "border-t border-gray-100" : ""}`}>
              {/* Cover */}
              <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {m.cover_url ? (
                  <Image src={m.cover_url} alt={m.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{m.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_COLORS[m.status]}`}>
                    {STATUS_LABELS[m.status as ManhwaStatus]}
                  </span>
                  <span className="text-xs text-gray-400">{m.chapters?.length ?? 0} ch</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/admin/manhwa/${m.id}/chapters`}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Kelola chapter"
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/manhwa/${m.id}/edit`}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <DeleteManhwaButton manhwaId={m.id} manhwaTitle={m.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
