import { LoginForm } from "@/components/admin/LoginForm";
import { BookOpen } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500 mb-4 shadow-lg shadow-red-200">
            <BookOpen className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-900">ManhwaKu</h1>
          <p className="text-sm text-gray-400 mt-1">Masuk ke panel admin</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
