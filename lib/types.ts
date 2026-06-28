// ============================================
// DATABASE TYPES
// ============================================

export type ManhwaStatus = "ongoing" | "completed" | "hiatus";

export interface Manhwa {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  cover_url: string | null;
  status: ManhwaStatus;
  genres: string[];
  author: string | null;
  artist: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  manhwa_id: string;
  number: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
  created_at: string;
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface ManhwaWithChapters extends Manhwa {
  chapters: Chapter[];
}

export interface ChapterWithPages extends Chapter {
  pages: Page[];
  manhwa: Pick<Manhwa, "id" | "title" | "slug">;
}

export interface ManhwaWithLatestChapter extends Manhwa {
  chapters: Pick<Chapter, "id" | "number" | "title" | "created_at">[];
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  perPage: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface ManhwaFormData {
  title: string;
  synopsis: string;
  status: ManhwaStatus;
  genres: string[];
  author: string;
  artist: string;
  cover?: File;
}

export interface ChapterFormData {
  number: number;
  title: string;
  pages: File[];
}

// ============================================
// CONSTANTS
// ============================================

export const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Isekai",
  "Manhwa",
  "Martial Arts",
  "Mystery",
  "Romance",
  "School Life",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

export const STATUS_LABELS: Record<ManhwaStatus, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};
