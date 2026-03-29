"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ItemInputProps {
  onAdd: (name: string, image?: string) => void;
}

export function ItemInput({ onAdd }: ItemInputProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, image.trim() || undefined);
    setName("");
    setImage("");
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="flex-1"
      />
      <Input
        placeholder="Image URL (optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        className="flex-1 hidden sm:block"
      />
      <Button type="button" onClick={handleAdd} disabled={!name.trim()} size="icon">
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
