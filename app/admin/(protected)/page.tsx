import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookMarked, BookOpen, Plus, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, ManhwaStatus } from "@/lib/types";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: manhwaCount },
    { count: chapterCount },
    { data: recentManhwa },
  ] = await Promise.all([
    supabase.from("manhwa").select("*", { count: "exact", head: true }),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("manhwa").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(6),
  ]);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Kelola koleksi manhwa lo</p>
        </div>
        <Link
          href="/admin/manhwa/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Total Manhwa</p>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <BookMarked className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="font-display text-4xl font-bold text-gray-900">{manhwaCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Total Chapter</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className="font-display text-4xl font-bold text-gray-900">{chapterCount ?? 0}</p>
        </div>
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Baru Diupdate</h2>
          <Link href="/admin/manhwa" className="text-xs text-red-500 hover:underline flex items-center gap-0.5">
            Lihat semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {!recentManhwa || recentManhwa.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">Belum ada manhwa</div>
        ) : (
          recentManhwa.map((m, i) => (
            <Link
              key={m.id}
              href={`/admin/manhwa/${m.id}/chapters`}
              className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group ${i !== 0 ? "border-t border-gray-100" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  m.status === "ongoing" ? "bg-emerald-400" : m.status === "completed" ? "bg-blue-400" : "bg-amber-400"
                }`} />
                <span className="text-sm font-medium text-gray-800 group-hover:text-red-500 transition-colors truncate">
                  {m.title}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-xs text-gray-400 hidden sm:block">{formatDate(m.updated_at)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-red-400 transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
