"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-8 text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-muted-foreground">
          We hit an unexpected error. Try again, or head back to the homepage.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="size-4" />
            Try Again
          </Button>
          <Button render={<Link href="/" />} className="gap-2">
            <Home className="size-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
