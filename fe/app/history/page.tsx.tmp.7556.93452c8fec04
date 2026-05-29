"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/nav-bar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { RecommendationLog, ChatSession } from "@/lib/types";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [recs, setRecs] = useState<RecommendationLog[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    Promise.allSettled([api.history.recommendations(1, 50), api.history.chat(1, 50)])
      .then(([r, c]) => {
        if (r.status === "fulfilled") setRecs(r.value.data);
        if (c.status === "fulfilled") setChats(c.value.data);
        if (r.status === "rejected")
          toast.error(r.reason instanceof ApiError ? r.reason.message : "Failed to load history");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <>
        <NavBar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-muted-foreground">Loading…</div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Your History</h1>

        <Tabs defaultValue="recommendations">
          <TabsList className="mb-6">
            <TabsTrigger value="recommendations">
              Recommendations ({recs.length})
            </TabsTrigger>
            <TabsTrigger value="chat">Chat ({chats.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations">
            {recs.length === 0 ? (
              <p className="text-muted-foreground">No recommendation history yet.</p>
            ) : (
              <div className="space-y-3">
                {recs.map((r) => (
                  <Card
                    key={r.id}
                    className="p-4 bg-card/50 border-primary/20 flex items-center justify-between"
                  >
                    <div>
                      <Link href={`/foods/${r.foodId}`} className="font-medium hover:text-primary">
                        {r.food?.description ?? `Food #${r.foodId}`}
                      </Link>
                      <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                    </div>
                    <Badge className="bg-primary/20 text-primary">
                      {Math.round(r.score * 100)}%
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            {chats.length === 0 ? (
              <p className="text-muted-foreground">No chat history yet.</p>
            ) : (
              <div className="space-y-3">
                {chats.map((s) => (
                  <Card key={s.id} className="p-4 bg-card/50 border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{s.title ?? `Session #${s.id}`}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s._count?.messages ?? s.messages?.length ?? 0} messages
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
