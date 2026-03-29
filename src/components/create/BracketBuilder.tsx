"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ItemInput } from "./ItemInput";

interface BracketBuilderProps {
  onSubmit: (title: string, items: { name: string; image?: string }[]) => void;
  isSubmitting: boolean;
}

export function BracketBuilder({ onSubmit, isSubmitting }: BracketBuilderProps) {
  const [title, setTitle] = useState("");
  const [items, setItems] = useState<{ name: string; image?: string }[]>([]);

  const minItems = 8;
  const maxItems = 64;
  const canCreate = title.trim().length > 0 && items.length >= minItems;

  function addItem(name: string, image?: string) {
    if (items.length >= maxItems) return;
    setItems((prev) => [...prev, { name, image }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit() {
    if (!canCreate) return;
    onSubmit(title.trim(), items);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Bracket Title</Label>
        <Input
          id="title"
          placeholder="e.g., Best Pizza Places in NYC"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Badge variant="outline">
            {items.length} / {maxItems}
            {items.length < minItems && ` (min ${minItems})`}
          </Badge>
        </div>

        <ItemInput onAdd={addItem} />

        {items.length > 0 && (
          <div className="mt-3 space-y-1 rounded-xl border p-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50"
              >
                <span className="w-6 text-right text-xs font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="flex-1 truncate text-sm">{item.name}</span>
                <div className="flex gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    <ArrowDown className="size-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!canCreate || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Creating..." : "Create Bracket"}
      </Button>
    </div>
  );
}
