import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Branding */}
          <p className="font-medium">
            Made with{" "}
            <Link href="/" className="font-bold hover:underline">
              <span className="text-foreground">Bracket</span>
              <span className="text-gradient-gold">Ranker</span>
            </Link>
          </p>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/tier-list-maker"
              className="transition-colors hover:text-foreground"
            >
              Tier List Maker
            </Link>
            <Link
              href="/leaderboard"
              className="transition-colors hover:text-foreground"
            >
              Leaderboard
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* More Games */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-6 md:justify-start">
          <span className="font-medium">More Games:</span>
          <a
            href="https://www.picktwo.io/"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-foreground"
          >
            This or That Polls
          </a>
          <a
            href="https://questionparties.com/"
            target="_blank"
            rel="noopener"
            className="transition-colors hover:text-foreground"
          >
            Party Question Generators
          </a>
        </div>
      </div>
    </footer>
  );
}
