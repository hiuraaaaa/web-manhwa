"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input, Textarea, Select, Button, Badge } from "@/components/ui";
import { GENRES, ManhwaStatus, Manhwa } from "@/lib/types";
import { generateSlug } from "@/lib/utils";
import { Upload, X } from "lucide-react";

interface Props {
  manhwa?: Manhwa;
}

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
];

export function ManhwaForm({ manhwa }: Props) {
  const router = useRouter();
  const isEdit = !!manhwa;

  const [title, setTitle] = useState(manhwa?.title ?? "");
  const [synopsis, setSynopsis] = useState(manhwa?.synopsis ?? "");
  const [status, setStatus] = useState<ManhwaStatus>(manhwa?.status ?? "ongoing");
  const [genres, setGenres] = useState<string[]>(manhwa?.genres ?? []);
  const [author, setAuthor] = useState(manhwa?.author ?? "");
  const [artist, setArtist] = useState(manhwa?.artist ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(manhwa?.cover_url ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleGenre(genre: string) {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Judul wajib diisi"); return; }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      let cover_url = manhwa?.cover_url ?? null;

      // Upload cover if changed
      if (coverFile) {
        const slug = generateSlug(title);
        const ext = coverFile.name.split(".").pop();
        const path = `${slug}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("covers").upload(path, coverFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("covers").getPublicUrl(path);
        cover_url = publicUrl;
      }

      const payload = {
        title: title.trim(),
        slug: generateSlug(title),
        synopsis: synopsis.trim() || null,
        status,
        genres,
        author: author.trim() || null,
        artist: artist.trim() || null,
        cover_url,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error } = await supabase.from("manhwa").update(payload).eq("id", manhwa.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("manhwa").insert(payload);
        if (error) throw error;
      }

      router.push("/admin/manhwa");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {/* Cover upload */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text-secondary">Cover</span>
        <div className="flex items-start gap-4">
          <div className="relative w-28 aspect-[3/4] rounded-lg overflow-hidden bg-bg-elevated border border-bg-border flex-shrink-0">
            {coverPreview ? (
              <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                <Upload className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" />
              {coverPreview ? "Ganti Cover" : "Upload Cover"}
            </Button>
            {coverPreview && (
              <Button variant="ghost" size="sm" onClick={() => { setCoverFile(null); setCoverPreview(null); }}>
                <X className="w-4 h-4" /> Hapus
              </Button>
            )}
            <p className="text-xs text-text-muted">JPG, PNG, WebP. Max 2MB.</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>
      </div>

      <Input
        label="Judul"
        placeholder="Solo Leveling"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Author" placeholder="Chugong" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <Input label="Artist" placeholder="DUBU" value={artist} onChange={(e) => setArtist(e.target.value)} />
      </div>

      <Textarea
        label="Sinopsis"
        placeholder="Cerita tentang..."
        value={synopsis}
        onChange={(e) => setSynopsis(e.target.value)}
        rows={4}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as ManhwaStatus)}
        options={STATUS_OPTIONS}
      />

      {/* Genres */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text-secondary">Genre</span>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                genres.includes(g)
                  ? "bg-accent/20 border-accent/50 text-accent"
                  : "border-bg-border text-text-secondary hover:border-accent/30 hover:text-text-primary"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.map((g) => (
              <Badge key={g} className="cursor-pointer" onClick={() => toggleGenre(g)}>
                {g} <X className="w-3 h-3 ml-1 inline" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} loading={loading}>
          {isEdit ? "Simpan Perubahan" : "Tambah Manhwa"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
      </div>
    </div>
  );
}
