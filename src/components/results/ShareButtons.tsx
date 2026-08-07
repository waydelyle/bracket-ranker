"use client";

import { useEffect, useState } from "react";
import { Check, Download, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site";
import {
  FacebookIcon,
  RedditIcon,
  ThreadsIcon,
  WhatsAppIcon,
  XIcon,
} from "./BrandIcons";

interface ShareButtonsProps {
  resultId: string;
  bracketName: string;
  champion: string;
  /** Runners-up, used to make the shared text worth reading. */
  runnersUp?: string[];
  categoryColor?: string;
}

export function ShareButtons({
  resultId,
  bracketName,
  champion,
  runnersUp = [],
  categoryColor,
}: ShareButtonsProps) {
  // Only known after mount, and gating the primary button on it would
  // otherwise cause a hydration mismatch.
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const resultUrl = `${SITE_URL}/results/${resultId}`;

  const podium = [champion, ...runnersUp.slice(0, 2)]
    .filter(Boolean)
    .map((name, index) => `${index + 1}. ${name}`)
    .join("  ");

  const shareText = `My ${bracketName} ranking:\n${podium}\n\nThink you can do better?`;
  const shortText = `${champion} won my ${bracketName} bracket. What's your #1?`;

  const targets = [
    {
      key: "x",
      label: "X",
      Icon: XIcon,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}&url=${encodeURIComponent(resultUrl)}`,
    },
    {
      key: "reddit",
      label: "Reddit",
      Icon: RedditIcon,
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(resultUrl)}&title=${encodeURIComponent(`My ${bracketName} ranking — ${champion} took it`)}`,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      Icon: WhatsAppIcon,
      href: `https://wa.me/?text=${encodeURIComponent(`${shortText} ${resultUrl}`)}`,
    },
    {
      key: "threads",
      label: "Threads",
      Icon: ThreadsIcon,
      href: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shortText} ${resultUrl}`)}`,
    },
    {
      key: "facebook",
      label: "Facebook",
      Icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(resultUrl)}`,
    },
  ];

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `My ${bracketName} ranking`,
        text: shareText,
        url: resultUrl,
      });
    } catch {
      // The user dismissed the sheet — not an error worth surfacing.
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopied(true);
      toast.success("Link copied — paste it anywhere");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/results/${resultId}/og`);
      if (!response.ok) throw new Error("image request failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${bracketName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-ranking.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Image saved — ready to post");
    } catch {
      toast.error("Could not build the image");
    }
  };

  const iconColor = categoryColor || "var(--primary)";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* On a phone this opens the OS sheet, which is where Instagram,
            TikTok, Messages and Discord actually live. */}
        {canNativeShare && (
          <Button
            size="sm"
            className="gap-1.5 font-semibold text-white"
            style={{ backgroundColor: iconColor }}
            onClick={handleNativeShare}
          >
            <Share2 className="size-3.5" />
            Share
          </Button>
        )}

        {targets.map(({ key, label, Icon, href }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className="gap-1.5 border-border bg-card hover:bg-secondary"
            aria-label={`Share on ${label}`}
            onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border bg-card hover:bg-secondary"
          onClick={handleCopyLink}
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <Link2 className="size-3.5" style={{ color: iconColor }} />
          )}
          {copied ? "Copied" : "Copy link"}
        </Button>

        {/* Instagram and TikTok have no share URL — an image file is the only
            way onto them, and a screenshot is worse than the real card. */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-border bg-card hover:bg-secondary"
          onClick={handleDownload}
        >
          <Download className="size-3.5" style={{ color: iconColor }} />
          Save image
        </Button>
      </div>
    </div>
  );
}
