"use client";

import { memo, useRef, useState } from "react";
import { Loader2, Play, Square } from "lucide-react";
import type { SoundCatalogItem } from "@/lib/sound-catalog";
import { formatDuration, formatSizeKb } from "@/lib/sound-catalog";
import { loadSoundAsset } from "@/lib/sound-loader";
import { playSound, type SoundPlayback } from "@/lib/play-sound";
import { cn } from "@/lib/utils";

type PlayState = "idle" | "loading" | "playing";

interface SoundCardProps {
  sound: SoundCatalogItem;
  onSelect: (sound: SoundCatalogItem) => void;
}

export const SoundCard = memo(function SoundCard({
  sound,
  onSelect,
}: SoundCardProps) {
  const playbackRef = useRef<SoundPlayback | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");

  const handleTogglePlayback = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (playState === "playing") {
      playbackRef.current?.stop();
      playbackRef.current = null;
      setPlayState("idle");
      return;
    }

    try {
      setPlayState("loading");
      const asset = await loadSoundAsset(sound.name);
      const playback = await playSound(asset.dataUri, {
        onEnd: () => {
          playbackRef.current = null;
          setPlayState("idle");
        },
      });
      playbackRef.current = playback;
      setPlayState("playing");
    } catch (err) {
      console.error(`[SoundCard] Failed to play "${sound.name}":`, err);
      playbackRef.current = null;
      setPlayState("idle");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(sound)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(sound);
        }
      }}
      className="border-input group relative flex cursor-pointer flex-col items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/50"
    >
      {/* Play button */}
      <button
        onClick={handleTogglePlayback}
        className={cn(
          "relative flex size-12 items-center justify-center rounded-full transition-colors",
          playState === "playing"
            ? "bg-foreground text-background"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
        aria-label={playState === "playing" ? "Stop sound" : "Play sound"}
      >
        {playState === "playing" && (
          <span className="bg-foreground/30 absolute inset-0 animate-ping rounded-full" />
        )}
        {playState === "loading" ? (
          <Loader2 className="size-5 animate-spin" />
        ) : playState === "playing" ? (
          <Square className="relative size-4" />
        ) : (
          <Play className="relative ml-0.5 size-5" />
        )}
      </button>

      {/* Sound name */}
      <span className="line-clamp-1 text-center text-sm font-medium">
        {sound.title}
      </span>

      {/* Duration + size */}
      <span className="text-muted-foreground text-xs">
        {formatDuration(sound.meta.duration)} ·{" "}
        {formatSizeKb(sound.meta.sizeKb)}
      </span>
    </div>
  );
});
