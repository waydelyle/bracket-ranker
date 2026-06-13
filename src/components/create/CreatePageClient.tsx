"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Link as LinkIcon, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BracketBuilder } from "@/components/create/BracketBuilder";
import { saveCustomBracket } from "@/app/actions/custom-brackets";

export function CreatePageClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function handleSubmit(
    title: string,
    items: { name: string; image?: string }[],
  ) {
    setIsSubmitting(true);
    try {
      const id = await saveCustomBracket({ title, items });
      setCreatedId(id);
      toast.success("Bracket created!");
    } catch {
      toast.error("Failed to create bracket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/create/${createdId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  if (createdId) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="mx-auto w-full max-w-md space-y-6 border-border/50 bg-card p-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <PlusCircle className="size-8 text-green-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Bracket Created!
            </h2>
            <p className="text-sm text-muted-foreground">
              Share the link with friends or start playing now.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.push(`/create/${createdId}`)}
              className="gap-2 bg-green-500 text-white hover:bg-green-600"
            >
              <Play className="size-4" />
              Play Now
            </Button>
            <Button
              variant="outline"
              onClick={copyLink}
              className="gap-2 border-border bg-card hover:bg-secondary"
            >
              <LinkIcon className="size-4" />
              Copy Share Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
            <PlusCircle className="size-7 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Free Bracket Maker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your own items, make a ranking generator for any topic, and
            share the bracket with friends. No account needed.
          </p>
        </div>

        <Card className="border-border/50 bg-card p-6">
          <BracketBuilder onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>

        <div className="mt-8 rounded-xl border border-border/50 bg-card p-5">
          <h2 className="font-bold text-white">
            What can I make with this bracket creator?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use it for custom tier list alternatives, top 10 rankings, team
            debates, party games, classroom polls, draft boards, or any list
            where head-to-head choices make the final order easier to trust.
          </p>
        </div>
      </div>
    </div>
  );
}
