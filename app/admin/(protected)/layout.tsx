import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar userEmail={user.email!} />
      <main className="flex-1 min-w-0 md:p-6 p-4 pt-16 md:pt-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
