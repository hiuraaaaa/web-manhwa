import { ManhwaForm } from "@/components/admin/ManhwaForm";

export default function NewManhwaPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-xl font-semibold text-text-primary">Tambah Manhwa</h1>
        <p className="text-sm text-text-secondary mt-0.5">Isi detail manhwa baru</p>
      </div>
      <ManhwaForm />
    </div>
  );
}
