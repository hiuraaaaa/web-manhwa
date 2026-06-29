"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Input, Button } from "@/components/ui";
import { Upload, X, AlertCircle, FileArchive } from "lucide-react";
import JSZip from "jszip";

interface Props {
  manhwaId: string;
  manhwaSlug: string;
  suggestedNumber: number;
}

interface PageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  order: number;
}

export function ChapterUploadForm({ manhwaId, manhwaSlug, suggestedNumber }: Props) {
  const router = useRouter();
  const [chapterNum, setChapterNum] = useState(String(suggestedNumber));
  const [chapterTitle, setChapterTitle] = useState("");
  const [pages, setPages] = useState<PageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

  function isImage(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    return IMAGE_EXTENSIONS.includes(ext);
  }

  function sortByFilename(files: PageFile[]) {
    return [...files].sort((a, b) => {
      const numA = parseInt(a.name.replace(/\D/g, "") || "0");
      const numB = parseInt(b.name.replace(/\D/g, "") || "0");
      if (numA !== numB) return numA - numB;
      return a.name.localeCompare(b.name);
    }).map((p, i) => ({ ...p, order: i + 1 }));
  }

  async function handleZipUpload(file: File) {
    setError("");
    setLoading(true);
    setProgressLabel("Membaca ZIP...");
    setProgress(0);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);

      const imageFiles: { name: string; file: JSZip.JSZipObject }[] = [];
      contents.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir && isImage(relativePath)) {
          // Skip macOS metadata folders
          if (!relativePath.startsWith("__MACOSX") && !relativePath.includes("/.")) {
            imageFiles.push({ name: relativePath.split("/").pop()!, file: zipEntry });
          }
        }
      });

      if (imageFiles.length === 0) {
        setError("Tidak ada gambar di dalam ZIP");
        setLoading(false);
        return;
      }

      // Sort by filename
      imageFiles.sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, "") || "0");
        const numB = parseInt(b.name.replace(/\D/g, "") || "0");
        if (numA !== numB) return numA - numB;
        return a.name.localeCompare(b.name);
      });

      const newPages: PageFile[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const { name, file: zipEntry } = imageFiles[i];
        setProgressLabel(`Ekstrak ${i + 1}/${imageFiles.length}: ${name}`);
        setProgress(Math.round(((i + 1) / imageFiles.length) * 100));

        const blob = await zipEntry.async("blob");
        const ext = name.split(".").pop()?.toLowerCase() ?? "jpg";
        const mimeType = ext === "webp" ? "image/webp" : ext === "png" ? "image/png" : "image/jpeg";
        const imageFile = new File([blob], name, { type: mimeType });
        const preview = URL.createObjectURL(imageFile);

        newPages.push({
          id: `${Date.now()}-${i}`,
          file: imageFile,
          preview,
          name,
          order: i + 1,
        });
      }

      setPages((prev) => sortByFilename([...prev, ...newPages]));
    } catch (e) {
      setError("Gagal membaca ZIP. Pastikan file tidak corrupt.");
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel("");
    }
  }

  function addImageFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const newPages: PageFile[] = arr.map((file, i) => ({
      id: `${Date.now()}-${i}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      order: pages.length + i + 1,
    }));
    setPages((prev) => sortByFilename([...prev, ...newPages]));
  }

  function removePage(id: string) {
    setPages((prev) => sortByFilename(prev.filter((p) => p.id !== id)));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    // Check if ZIP
    if (files[0].name.endsWith(".zip") || files[0].type === "application/zip") {
      handleZipUpload(files[0]);
    } else {
      addImageFiles(files);
    }
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
        const ext = page.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${manhwaSlug}/ch${num}/${String(i + 1).padStart(3, "0")}.${ext}`;

        setProgressLabel(`Upload halaman ${i + 1}/${pages.length}`);
        setProgress(Math.round(((i + 1) / pages.length) * 100));

        const { error: upErr } = await supabase.storage
          .from("chapters")
          .upload(path, page.file, { upsert: true });

        if (upErr) throw upErr;

        const { data: { publicUrl } } = supabase.storage.from("chapters").getPublicUrl(path);
        pageInserts.push({ chapter_id: chapter.id, page_number: i + 1, image_url: publicUrl });
      }

      const { error: pagesErr } = await supabase.from("pages").insert(pageInserts);
      if (pagesErr) throw pagesErr;

      router.push(`/admin/(protected)/manhwa/${manhwaId}/chapters`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload gagal");
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressLabel("");
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

      {/* Upload options */}
      <div className="grid grid-cols-2 gap-3">
        {/* ZIP upload */}
        <button
          onClick={() => zipRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-accent/40 hover:border-accent hover:bg-accent/5 transition-colors disabled:opacity-50"
        >
          <FileArchive className="w-7 h-7 text-accent" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Upload ZIP</p>
            <p className="text-xs text-text-muted">Auto-extract semua gambar</p>
          </div>
          <input
            ref={zipRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleZipUpload(e.target.files[0])}
          />
        </button>

        {/* Image upload */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-bg-border hover:border-accent/40 hover:bg-bg-elevated transition-colors disabled:opacity-50"
        >
          <Upload className="w-7 h-7 text-text-muted" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Upload Gambar</p>
            <p className="text-xs text-text-muted">JPG, PNG, WebP</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && addImageFiles(e.target.files)}
          />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver ? "border-accent bg-accent/10" : "border-bg-border"
        }`}
      >
        <p className="text-sm text-text-muted">atau drag & drop ZIP / gambar di sini</p>
      </div>

      {/* Extract/Upload progress */}
      {loading && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{progressLabel}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Page list */}
      {pages.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">{pages.length} halaman</span>
            <button onClick={() => setPages([])} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Hapus semua
            </button>
          </div>
          <div className="bg-bg-surface border border-bg-border rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            {pages.map((page, i) => (
              <div key={page.id} className={`flex items-center gap-3 px-3 py-2 ${i !== 0 ? "border-t border-bg-border" : ""}`}>
                <span className="text-xs text-text-muted w-6 text-right flex-shrink-0">{page.order}</span>
                <div className="relative w-8 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image src={page.preview} alt={`Page ${page.order}`} fill className="object-cover" />
                </div>
                <p className="text-xs text-text-secondary flex-1 truncate">{page.name}</p>
                <button onClick={() => removePage(page.id)} className="p-1 rounded text-text-muted hover:text-red-400 transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
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
        <Button onClick={handleUpload} loading={loading} disabled={pages.length === 0 || loading}>
          Upload Chapter
        </Button>
        <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
          Batal
        </Button>
      </div>
    </div>
  );
}
