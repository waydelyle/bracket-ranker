import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:justify-between">
        {/* Branding */}
        <p className="font-medium">
          Made with{" "}
          <Link href="/" className="font-bold hover:underline">
            <span className="text-foreground">Bracket</span>
            <span className="text-gradient-gold">Ranker</span>
          </Link>
        </p>

        {/* Links */}
        <nav className="flex gap-6">
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
    </footer>
  );
}
