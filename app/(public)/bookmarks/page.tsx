"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, Trash2 } from "lucide-react";
import { getBookmarks, removeBookmark, Bookmark } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Record<string, Bookmark>>({});

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  function handleRemove(slug: string) {
    removeBookmark(slug);
    setBookmarks(getBookmarks());
  }

  const items = Object.values(bookmarks).sort((a, b) =>
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="font-display font-bold text-base text-gray-900">Lanjut Baca</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Belum ada bookmark</p>
            <p className="text-sm text-gray-400">Tap ikon bookmark saat baca chapter untuk menyimpan progress</p>
            <Link href="/" className="mt-4 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl">
              Mulai Baca
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-gray-400 mb-2">{items.length} manhwa tersimpan</p>
            {items.map(bm => (
              <div key={bm.manhwaSlug} className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{bm.manhwaTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Chapter {bm.chapterNumber} · {formatDate(bm.savedAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/manhwa/${bm.manhwaSlug}/chapter/${bm.chapterNumber}`}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Lanjut
                  </Link>
                  <button
                    onClick={() => handleRemove(bm.manhwaSlug)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
