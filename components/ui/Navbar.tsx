import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-bg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-text-primary hover:text-accent transition-colors">
          <BookOpen className="w-5 h-5 text-accent" />
          ManhwaKu
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-elevated transition-colors">
            Beranda
          </Link>
        </nav>
      </div>
    </header>
  );
}
