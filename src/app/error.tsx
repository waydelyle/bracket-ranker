"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // React catches these errors before the browser's global handlers see them.
    // Reporting must never prevent the fallback screen from offering recovery.
    let attempted = false;
    const report = () => {
      if (attempted) return true;
      try {
        const sentry = (window as Window & {
          Sentry?: { captureException?: (error: unknown) => unknown };
        }).Sentry;
        if (typeof sentry?.captureException !== "function") return false;
        attempted = true;
        sentry.captureException(error);
      } catch {
        // A reporting failure must not interfere with recovery.
        attempted = true;
      }
      return true;
    };

    // The deferred loader may still be downloading when this screen mounts.
    // Retry once after document load, and discard stale errors on cleanup.
    if (report() || document.readyState === "complete") return;
    const onLoad = () => { report(); };
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        {/* Icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/20">
          <AlertTriangle className="size-8 text-destructive" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
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
          <Button
            onClick={retry}
            variant="outline"
            className="gap-2 border-destructive/30 hover:bg-destructive/10"
          >
            <RotateCcw className="size-4" />
            Try Again
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="gap-2 bg-destructive text-white hover:bg-destructive/90"
          >
            <Home className="size-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
