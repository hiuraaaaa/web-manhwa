"use client";
import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { saveBookmark, getBookmark, removeBookmark } from "@/lib/utils";

interface Props {
  manhwaSlug: string;
  manhwaTitle: string;
  chapterNumber: number;
}

export function ReaderControls({ manhwaSlug, manhwaTitle, chapterNumber }: Props) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const bm = getBookmark(manhwaSlug);
    setBookmarked(bm?.chapterNumber === chapterNumber);
  }, [manhwaSlug, chapterNumber]);

  function toggleBookmark() {
    if (bookmarked) {
      removeBookmark(manhwaSlug);
      setBookmarked(false);
    } else {
      saveBookmark({
        manhwaSlug,
        manhwaTitle,
        chapterNumber,
        pageNumber: 1,
        savedAt: new Date().toISOString(),
      });
      setBookmarked(true);
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors text-text-secondary hover:text-accent"
      title={bookmarked ? "Hapus bookmark" : "Bookmark chapter ini"}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-4 h-4 text-accent" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </button>
  );
}
