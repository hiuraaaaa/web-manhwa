import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ManhwaForm } from "@/components/admin/ManhwaForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditManhwaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: manhwa } = await supabase.from("manhwa").select("*").eq("id", id).single();
  if (!manhwa) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-text-primary">Edit Manhwa</h1>
        <p className="text-sm text-text-secondary mt-0.5 truncate">{manhwa.title}</p>
      </div>
      <ManhwaForm manhwa={manhwa} />
    </div>
  );
}
