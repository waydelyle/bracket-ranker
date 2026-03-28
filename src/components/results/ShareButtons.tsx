"use client";

import { Copy, Link, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  resultId: string;
  bracketName: string;
  champion: string;
}

export function ShareButtons({
  resultId,
  bracketName,
  champion,
}: ShareButtonsProps) {
  const resultUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/results/${resultId}`
      : `https://bracketranker.com/results/${resultId}`;

  const tweetText = `My ${bracketName} ranking: ${champion} is #1! What's yours?`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(resultUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleChallenge = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      toast.success("Link copied! Send it to a friend to challenge them.");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => window.open(twitterUrl, "_blank", "noopener,noreferrer")}
      >
        <Share2 className="size-3.5" />
        Share on X
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleCopyLink}
      >
        <Copy className="size-3.5" />
        Copy Link
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleChallenge}
      >
        <Link className="size-3.5" />
        Challenge a Friend
      </Button>
    </div>
  );
}
