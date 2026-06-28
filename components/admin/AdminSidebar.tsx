"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, BookMarked, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/manhwa", label: "Manhwa", icon: BookMarked, exact: false },
];

interface Props {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 bg-bg-surface border-r border-bg-border flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-bg-border">
        <Link href="/" className="flex items-center gap-2 text-text-primary font-display font-semibold">
          <BookOpen className="w-5 h-5 text-accent" />
          ManhwaKu
        </Link>
        <span className="text-xs text-text-muted mt-0.5 block">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-2 pt-2 border-t border-bg-border">
          <Link
            href="/admin/manhwa/new"
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === "/admin/manhwa/new"
                ? "bg-accent text-white font-medium"
                : "text-accent border border-accent/30 hover:bg-accent/10"
            )}
          >
            <Plus className="w-4 h-4" />
            Tambah Manhwa
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-bg-border">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-text-muted truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
