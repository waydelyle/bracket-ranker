"use client";

import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UndoButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function UndoButton({ onClick, disabled }: UndoButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-1.5"
    >
      <Undo2 className="size-3.5" />
      Undo
    </Button>
  );
}
