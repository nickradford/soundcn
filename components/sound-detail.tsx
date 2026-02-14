"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Loader2, Play, Square } from "lucide-react";
import type { SoundCatalogItem } from "@/lib/sound-catalog";
import { formatDuration, formatSizeKb } from "@/lib/sound-catalog";
import { loadSoundAsset } from "@/lib/sound-loader";
import { playSound, type SoundPlayback } from "@/lib/play-sound";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

type PlayState = "idle" | "loading" | "playing";

function toCamelCase(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function CopyRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="group/row relative">
        <pre className="bg-secondary/50 border-border/30 overflow-x-auto rounded-lg border p-3 pr-10 text-sm leading-relaxed [scrollbar-width:none]">
          <code className="font-mono">{text}</code>
        </pre>
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-2 top-2 flex size-7 items-center justify-center rounded-md transition-opacity hover:bg-accent",
            copied ? "opacity-100" : "opacity-0 group-hover/row:opacity-100"
          )}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="size-3.5 text-green-500" aria-hidden="true" />
          ) : (
            <Copy className="text-muted-foreground size-3.5" aria-hidden="true" />
          )}
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? `${label} copied to clipboard` : ""}
        </span>
      </div>
    </div>
  );
}

interface SoundDetailProps {
  sound: SoundCatalogItem | null;
  onClose: () => void;
}

export function SoundDetail({ sound, onClose }: SoundDetailProps) {
  const playbackRef = useRef<SoundPlayback | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");

  const exportName = sound ? `${toCamelCase(sound.name)}Sound` : "";
  const installCmd = sound
    ? `npx shadcn add https://soundcn.dev/r/${sound.name}.json`
    : "";
  const usageCode = sound
    ? `import { useSound } from "@/hooks/use-sound";
import { ${exportName} } from "@/sounds/${sound.name}";

const [play] = useSound(${exportName});`
    : "";

  useEffect(() => {
    return () => {
      playbackRef.current?.stop();
      playbackRef.current = null;
    };
  }, [sound?.name]);

  useEffect(() => {
    setPlayState("idle");
  }, [sound?.name]);

  const handleDownload = async () => {
    if (!sound) return;
    try {
      const asset = await loadSoundAsset(sound.name);
      const res = await fetch(asset.dataUri);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sound.name}.${asset.format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`[SoundDetail] Failed to download "${sound.name}":`, err);
    }
  };

  const handleTogglePlayback = async () => {
    if (!sound) return;

    if (playState === "playing") {
      playbackRef.current?.stop();
      playbackRef.current = null;
      setPlayState("idle");
      return;
    }

    try {
      setPlayState("loading");
      const asset = await loadSoundAsset(sound.name);
      const pb = await playSound(asset.dataUri, {
        onEnd: () => {
          playbackRef.current = null;
          setPlayState("idle");
        },
      });
      playbackRef.current = pb;
      setPlayState("playing");
    } catch (err) {
      console.error(`[SoundDetail] Failed to play "${sound.name}":`, err);
      playbackRef.current = null;
      setPlayState("idle");
    }
  };

  return (
    <Drawer
      open={!!sound}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        {sound && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-8">
            <DrawerHeader className="px-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlayback}
                  className={cn(
                    "relative flex size-14 shrink-0 items-center justify-center rounded-full transition-[color,background-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                    playState === "playing"
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                  aria-label={
                    playState === "playing" ? "Stop sound" : "Play sound"
                  }
                >
                  {playState === "playing" && (
                    <span className="bg-primary/25 absolute inset-0 animate-ping motion-reduce:animate-none rounded-full" />
                  )}
                  {playState === "loading" ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : playState === "playing" ? (
                    <Square className="relative size-5" />
                  ) : (
                    <Play className="relative ml-0.5 size-6" />
                  )}
                </button>

                <div className="min-w-0 flex-1 text-left">
                  <DrawerTitle className="truncate text-lg">
                    {sound.title}
                  </DrawerTitle>
                  <DrawerDescription>
                    {sound.broadCategory} ·{" "}
                    {formatDuration(sound.meta.duration)} ·{" "}
                    {formatSizeKb(sound.meta.sizeKb)} · {sound.meta.license}
                  </DrawerDescription>
                </div>

                <button
                  onClick={handleDownload}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                  aria-label="Download sound file"
                >
                  <Download className="size-5" />
                </button>
              </div>
            </DrawerHeader>

            {sound.description && (
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                {sound.description}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <CopyRow label="Install" text={installCmd} />
              <CopyRow label="Usage" text={usageCode} />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
