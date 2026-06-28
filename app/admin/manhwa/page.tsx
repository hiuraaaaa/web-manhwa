import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, BookOpen, Trash2 } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { STATUS_LABELS, ManhwaStatus } from "@/lib/types";
import { DeleteManhwaButton } from "@/components/admin/DeleteManhwaButton";

export default async function AdminManhwaPage() {
  const supabase = await createClient();

  const { data: manhwaList } = await supabase
    .from("manhwa")
    .select("*, chapters(id)")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Manhwa</h1>
          <p className="text-sm text-text-secondary mt-0.5">{manhwaList?.length ?? 0} total</p>
        </div>
        <Link
          href="/admin/manhwa/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Manhwa
        </Link>
      </div>

      {!manhwaList || manhwaList.length === 0 ? (
        <EmptyState
          title="Belum ada manhwa"
          description="Mulai dengan menambahkan manhwa pertama"
          action={
            <Link href="/admin/manhwa/new" className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm rounded-lg">
              <Plus className="w-4 h-4" /> Tambah Manhwa
            </Link>
          }
        />
      ) : (
        <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
          {manhwaList.map((m, i) => (
            <div key={m.id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-bg-border" : ""}`}>
              {/* Cover thumbnail */}
              <div className="relative w-10 h-14 rounded overflow-hidden bg-bg-elevated flex-shrink-0">
                {m.cover_url ? (
                  <Image src={m.cover_url} alt={m.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    <BookOpen className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{m.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={m.status as ManhwaStatus}>{STATUS_LABELS[m.status as ManhwaStatus]}</Badge>
                  <span className="text-xs text-text-muted">{m.chapters?.length ?? 0} chapter</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/admin/manhwa/${m.id}/chapters`}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  title="Kelola chapter"
                >
                  <BookOpen className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/manhwa/${m.id}/edit`}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  title="Edit manhwa"
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
