"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";

const ACTIVITY = ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"];
const GOALS = ["MUSCLEGAIN", "WEIGHTLOSS", "ENERGY", "ENDURANCE", "RECOVERY", "GENERAL_HEALTH"];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    api.profile
      .get()
      .then((res) => {
        setEmail(res.data.email);
        if (res.data.profile) setForm(res.data.profile);
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<Profile> = {
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        activityLevel: form.activityLevel || undefined,
        goal: form.goal || undefined,
      };
      const res = await api.profile.update(payload);
      setForm(res.data);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-muted-foreground">Loading…</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground text-sm">{email}</p>
          </div>
          {user?.role === "ADMIN" && <Badge className="bg-primary">ADMIN</Badge>}
        </div>

        <Card className="p-8 bg-card/50 border-primary/20">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age ?? ""}
                  onChange={(e) => set("age", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={form.gender ?? undefined}
                  onValueChange={(v) => set("gender", v as Profile["gender"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={form.weight ?? ""}
                  onChange={(e) => set("weight", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={form.height ?? ""}
                  onChange={(e) => set("height", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Activity level</Label>
                <Select
                  value={form.activityLevel ?? undefined}
                  onValueChange={(v) => set("activityLevel", v as Profile["activityLevel"])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Goal</Label>
                <Select
                  value={form.goal ?? undefined}
                  onValueChange={(v) => set("goal", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
