"use client";

import { useCallback, useMemo, useState } from "react";
import { Github, Volume2 } from "lucide-react";
import {
  ALL_CATEGORY,
  CATEGORY_ORDER,
  type SoundCatalogItem,
} from "@/lib/sound-catalog";
import { CategoryFilter } from "@/components/category-filter";
import { SoundGrid } from "@/components/sound-grid";
import { SoundSearch } from "@/components/sound-search";
import { SoundDetail } from "@/components/sound-detail";

interface SoundsPageProps {
  sounds: SoundCatalogItem[];
}

export function SoundsPage({ sounds }: SoundsPageProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [selectedSound, setSelectedSound] = useState<SoundCatalogItem | null>(
    null
  );

  const filteredSounds = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return sounds.filter((sound) => {
      const categoryMatch =
        activeCategory === ALL_CATEGORY ||
        sound.broadCategory === activeCategory;

      if (!categoryMatch) return false;
      if (!normalized) return true;

      const searchableText = [
        sound.name,
        sound.title,
        sound.description,
        sound.meta.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalized);
    });
  }, [activeCategory, query, sounds]);

  const categoryOptions = useMemo(() => {
    const categoryCounts = sounds.reduce<Record<string, number>>(
      (acc, sound) => {
        const key = sound.broadCategory;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {}
    );

    const ordered = CATEGORY_ORDER.filter(
      (cat) => (categoryCounts[cat] ?? 0) > 0
    ).map((cat) => ({
      key: cat,
      label: cat,
      count: categoryCounts[cat] ?? 0,
    }));

    return [
      { key: ALL_CATEGORY, label: "All", count: sounds.length },
      ...ordered,
    ];
  }, [sounds]);

  const handleSelect = useCallback((sound: SoundCatalogItem) => {
    setSelectedSound(sound);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedSound(null);
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="size-5" />
          <span className="text-lg font-bold tracking-tight">soundcn</span>
        </div>
        <a
          href="https://github.com/soundcn/soundcn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="GitHub"
        >
          <Github className="size-5" />
        </a>
      </header>

      {/* Hero */}
      <div className="flex flex-col items-center gap-6 pt-4 pb-2">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sound effects for the modern web.
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Copy. Paste. Play.
          </p>
        </div>

        <SoundSearch
          value={query}
          onChange={setQuery}
          totalCount={sounds.length}
        />
      </div>

      {/* Categories */}
      <CategoryFilter
        options={categoryOptions}
        activeCategory={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Results count */}
      <p className="text-muted-foreground text-sm">
        {filteredSounds.length} sound{filteredSounds.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <SoundGrid sounds={filteredSounds} onSelect={handleSelect} />

      {/* Detail panel */}
      {selectedSound && (
        <SoundDetail sound={selectedSound} onClose={handleClose} />
      )}
    </div>
  );
}
