import { LoginForm } from "@/components/admin/LoginForm";
import { BookOpen } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/15 mb-4">
            <BookOpen className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-text-primary">ManhwaKu</h1>
          <p className="text-sm text-text-secondary mt-1">Login ke admin panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
