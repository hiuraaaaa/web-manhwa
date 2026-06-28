import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookMarked, BookOpen, TrendingUp, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: manhwaCount },
    { count: chapterCount },
    { data: recentManhwa },
  ] = await Promise.all([
    supabase.from("manhwa").select("*", { count: "exact", head: true }),
    supabase.from("chapters").select("*", { count: "exact", head: true }),
    supabase.from("manhwa").select("id, title, slug, status, updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Total Manhwa", value: manhwaCount ?? 0, icon: BookMarked, color: "text-accent" },
    { label: "Total Chapter", value: chapterCount ?? 0, icon: BookOpen, color: "text-status-ongoing" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Overview koleksi manhwa lo</p>
        </div>
        <Link
          href="/admin/manhwa/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Manhwa
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-bg-surface border border-bg-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="font-display text-3xl font-semibold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-text-secondary" />
          <h2 className="font-medium text-text-primary">Baru Diupdate</h2>
        </div>
        <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
          {!recentManhwa || recentManhwa.length === 0 ? (
            <div className="py-10 text-center text-sm text-text-muted">Belum ada manhwa</div>
          ) : (
            recentManhwa.map((m, i) => (
              <Link
                key={m.id}
                href={`/admin/manhwa/${m.id}/chapters`}
                className={`flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors group ${i !== 0 ? "border-t border-bg-border" : ""}`}
              >
                <span className="text-sm text-text-primary group-hover:text-accent transition-colors truncate">{m.title}</span>
                <span className="text-xs text-text-muted ml-4 flex-shrink-0">{formatDate(m.updated_at)}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
