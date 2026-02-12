"use client";

import { cn } from "@/lib/utils";

export interface CategoryFilterOption {
  key: string;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  options: CategoryFilterOption[];
  activeCategory: string;
  onChange: (category: string) => void;
}

export function CategoryFilter({
  options,
  activeCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="scrollbar-hide overflow-x-auto">
      <div className="flex min-w-max gap-2">
        {options.map((option) => {
          const isActive = option.key === activeCategory;
          return (
            <button
              key={option.key}
              onClick={() => onChange(option.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background border-transparent"
                  : "border-input bg-background text-foreground hover:bg-accent"
              )}
            >
              {option.label}
              <span
                className={cn(
                  "text-xs",
                  isActive ? "text-background/70" : "text-muted-foreground"
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
