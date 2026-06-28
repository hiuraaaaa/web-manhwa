import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatChapterNumber(num: number): string {
  return Number.isInteger(num) ? `Chapter ${num}` : `Chapter ${num.toFixed(1)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// localStorage bookmark helpers
const BOOKMARK_KEY = "manhwa_bookmarks";

export interface Bookmark {
  manhwaSlug: string;
  manhwaTitle: string;
  chapterNumber: number;
  pageNumber: number;
  savedAt: string;
}

export function getBookmarks(): Record<string, Bookmark> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveBookmark(bookmark: Bookmark): void {
  if (typeof window === "undefined") return;
  const bookmarks = getBookmarks();
  bookmarks[bookmark.manhwaSlug] = bookmark;
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
}

export function getBookmark(manhwaSlug: string): Bookmark | null {
  const bookmarks = getBookmarks();
  return bookmarks[manhwaSlug] || null;
}

export function removeBookmark(manhwaSlug: string): void {
  if (typeof window === "undefined") return;
  const bookmarks = getBookmarks();
  delete bookmarks[manhwaSlug];
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
}
