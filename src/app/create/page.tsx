"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Link as LinkIcon, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BracketBuilder } from "@/components/create/BracketBuilder";
import { saveCustomBracket } from "@/app/actions/custom-brackets";

export default function CreatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function handleSubmit(
    title: string,
    items: { name: string; image?: string }[]
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
        <Card className="mx-auto w-full max-w-md space-y-6 p-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <PlusCircle className="size-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Bracket Created!
            </h2>
            <p className="text-sm text-muted-foreground">
              Share the link with friends or start playing now.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push(`/create/${createdId}`)} className="gap-2">
              <Play className="size-4" />
              Play Now
            </Button>
            <Button variant="outline" onClick={copyLink} className="gap-2">
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
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="size-7 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create a Bracket
          </h1>
          <p className="mt-2 text-muted-foreground">
            Add your own items and share the bracket with friends. No account needed.
          </p>
        </div>

        <Card className="p-6">
          <BracketBuilder onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>
      </div>
    </div>
  );
}
