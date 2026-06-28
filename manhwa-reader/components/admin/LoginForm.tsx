"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input, Button } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau password salah");
    } else {
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="bg-bg-surface border border-bg-border rounded-xl p-6 flex flex-col gap-4">
      <Input
        label="Email"
        type="email"
        placeholder="admin@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={handleLogin} loading={loading} size="lg" className="w-full mt-1">
        Login
      </Button>
    </div>
  );
}
