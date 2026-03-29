"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/categories";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <>
          {/* Dark overlay */}
          <div
            className="fixed inset-0 top-14 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="absolute inset-x-0 top-14 z-50 border-b border-border bg-background p-4 shadow-lg">
            <nav className="flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className="ml-auto size-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </Link>
              ))}

              <div className="mt-2 border-t border-border pt-2">
                <Link
                  href="/create"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-muted"
                >
                  <Plus className="size-4" />
                  Create Bracket
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
