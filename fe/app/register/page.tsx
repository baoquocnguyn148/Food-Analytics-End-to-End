"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// useAuth intentionally not imported — register redirects to /login without auto-login
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.auth.register(email, password);
      toast.success("Tạo tài khoản thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent">
      <Card className="w-full max-w-md p-8 bg-card/70 border-primary/20 backdrop-blur">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          NutriHub
        </Link>
        <h1 className="text-2xl font-bold mt-6 mb-1">Create account</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Start your personalized nutrition journey
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
            {loading ? "Creating..." : "Create account"}
            {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
