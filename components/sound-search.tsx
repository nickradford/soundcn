"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SoundSearchProps {
  value: string;
  onChange: (value: string) => void;
  totalCount: number;
}

export function SoundSearch({ value, onChange, totalCount }: SoundSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <Search className="text-muted-foreground absolute left-4 top-1/2 size-5 -translate-y-1/2" />
      <input
        ref={inputRef}
        type="text"
        placeholder={`Search ${totalCount} sounds...`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 focus-visible:border-ring h-12 w-full rounded-xl border pl-12 pr-16 text-base shadow-sm outline-none transition-shadow focus-visible:ring-[3px]"
      />
      <kbd className="text-muted-foreground/70 border-input pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border bg-transparent px-2 py-0.5 text-xs font-medium sm:inline-block">
        ⌘K
      </kbd>
    </div>
  );
}
