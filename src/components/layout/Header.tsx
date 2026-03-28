import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CategoryNav } from "./CategoryNav";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="text-lg font-extrabold tracking-tight">
            Bracket<span className="text-primary">Ranker</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden flex-1 justify-center md:flex">
          <CategoryNav />
        </div>

        {/* Create button (desktop) */}
        <div className="hidden md:block">
          <Link
            href="/create"
            className={buttonVariants({ size: "sm", className: "gap-1.5 rounded-full" })}
          >
            <Plus className="size-4" />
            Create
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="flex flex-1 justify-end md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
