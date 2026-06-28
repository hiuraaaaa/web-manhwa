"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input, Button } from "@/components/ui";
import { Upload, X, GripVertical, AlertCircle } from "lucide-react";

interface Props {
  manhwaId: string;
  manhwaSlug: string;
  suggestedNumber: number;
}

interface PageFile {
  id: string;
  file: File;
  preview: string;
  order: number;
}

export function ChapterUploadForm({ manhwaId, manhwaSlug, suggestedNumber }: Props) {
  const router = useRouter();
  const [chapterNum, setChapterNum] = useState(String(suggestedNumber));
  const [chapterTitle, setChapterTitle] = useState("");
  const [pages, setPages] = useState<PageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newPages: PageFile[] = arr.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      order: pages.length + i + 1,
    }));
    setPages((prev) => [...prev, ...newPages]);
  }

  function removePage(id: string) {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, i) => ({ ...p, order: i + 1 }));
    });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPages((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr.map((p, i) => ({ ...p, order: i + 1 }));
    });
  }

  function moveDown(index: number) {
    setPages((prev) => {
      if (index === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr.map((p, i) => ({ ...p, order: i + 1 }));
    });
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }, [pages]);

  async function handleUpload() {
    const num = parseFloat(chapterNum);
    if (isNaN(num) || num <= 0) { setError("Nomor chapter tidak valid"); return; }
    if (pages.length === 0) { setError("Upload minimal 1 halaman"); return; }
    setError("");
    setLoading(true);
    setProgress(0);

    try {
      const supabase = createClient();

      // Create chapter
      const { data: chapter, error: chErr } = await supabase
        .from("chapters")
        .insert({ manhwa_id: manhwaId, number: num, title: chapterTitle.trim() || null })
        .select()
        .single();

      if (chErr) throw chErr;

      // Upload pages
      const pageInserts = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const ext = page.file.name.split(".").pop();
        const path = `${manhwaSlug}/ch${num}/${String(i + 1).padStart(3, "0")}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("chapters")
          .upload(path, page.file, { upsert: true });

        if (upErr) throw upErr;

        const { data: { publicUrl } } = supabase.storage.from("chapters").getPublicUrl(path);
        pageInserts.push({ chapter_id: chapter.id, page_number: i + 1, image_url: publicUrl });

        setProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      const { error: pagesErr } = await supabase.from("pages").insert(pageInserts);
      if (pagesErr) throw pagesErr;

      router.push(`/admin/manhwa/${manhwaId}/chapters`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Nomor Chapter"
          type="number"
          step="0.1"
          min="0.1"
          value={chapterNum}
          onChange={(e) => setChapterNum(e.target.value)}
          hint="Boleh desimal, misal 10.5"
        />
        <Input
          label="Judul Chapter (opsional)"
          placeholder="The Awakening"
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
        />
      </div>

      {/* Drop zone */}
      <div>
        <span className="text-sm font-medium text-text-secondary block mb-1.5">Halaman</span>
        <div
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
            dragOver ? "border-accent bg-accent/10" : "border-bg-border hover:border-accent/40 hover:bg-bg-elevated"
          }`}
        >
          <Upload className="w-8 h-8 text-text-muted" />
          <div className="text-center">
            <p className="text-sm text-text-secondary">Drag & drop gambar di sini</p>
            <p className="text-xs text-text-muted">atau klik untuk pilih file</p>
            <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP • Multi-select didukung</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Page previews */}
      {pages.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">{pages.length} halaman</span>
            <button onClick={() => setPages([])} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Hapus semua
            </button>
          </div>
          <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden">
            {pages.map((page, i) => (
              <div key={page.id} className={`flex items-center gap-3 px-3 py-2 ${i !== 0 ? "border-t border-bg-border" : ""}`}>
                <span className="text-xs text-text-muted w-6 text-right flex-shrink-0">{page.order}</span>
                <div className="relative w-8 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image src={page.preview} alt={`Page ${page.order}`} fill className="object-cover" />
                </div>
                <p className="text-xs text-text-secondary flex-1 truncate">{page.file.name}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">▲</button>
                  <button onClick={() => moveDown(i)} disabled={i === pages.length - 1} className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors">▼</button>
                  <button onClick={() => removePage(page.id)} className="p-1 rounded text-text-muted hover:text-red-400 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      {loading && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Mengupload halaman...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button onClick={handleUpload} loading={loading} disabled={pages.length === 0}>
          Upload Chapter
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
      </div>
    </div>
  );
}
