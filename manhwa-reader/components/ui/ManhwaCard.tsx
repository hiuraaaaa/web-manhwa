import Link from "next/link";
import Image from "next/image";
import { ManhwaWithLatestChapter, STATUS_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

interface ManhwaCardProps {
  manhwa: ManhwaWithLatestChapter;
}

export function ManhwaCard({ manhwa }: ManhwaCardProps) {
  const latestChapter = manhwa.chapters?.[0];

  return (
    <Link href={`/manhwa/${manhwa.slug}`} className="group block">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-bg-elevated mb-2">
        {manhwa.cover_url ? (
          <Image
            src={manhwa.cover_url}
            alt={manhwa.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant={manhwa.status}>{STATUS_LABELS[manhwa.status]}</Badge>
        </div>
        {latestChapter && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
            <p className="text-xs text-white/90 font-medium">
              Ch. {latestChapter.number}
            </p>
            <p className="text-xs text-white/50">{formatDate(latestChapter.created_at)}</p>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-accent transition-colors">
        {manhwa.title}
      </h3>
    </Link>
  );
}
