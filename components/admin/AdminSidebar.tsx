"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, BookMarked, LogOut, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/(protected)/manhwa", label: "Manhwa", icon: BookMarked, exact: false },
];

interface Props {
  userEmail: string;
}

export function AdminSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-gray-900">
          <BookOpen className="w-5 h-5 text-red-500" strokeWidth={2.5} />
          ManhwaKu
        </Link>
        <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Add button */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/admin/(protected)/manhwa/new"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah Manhwa
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-red-50 text-red-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("w-4 h-4", active ? "text-red-500" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-1 mb-2">
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-red-500">{userEmail[0].toUpperCase()}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar trigger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 h-13 py-2.5 flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100">
          <BookMarked className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-display font-bold text-gray-900 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-red-500" /> Admin
        </span>
      </div>
    </>
  );
}
