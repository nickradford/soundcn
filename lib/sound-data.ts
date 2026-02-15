import registry from "@/registry.json";
import { getBroadCategory, type SoundCatalogItem } from "@/lib/sound-catalog";

let _cache: SoundCatalogItem[] | null = null;
let _index: Map<string, SoundCatalogItem> | null = null;

function ensureCache() {
  if (_cache) return;

  _cache = registry.items
    .filter((item) => item.type === "registry:block")
    .map((item) => {
      const primaryCategory = item.categories?.[0] ?? "uncategorized";
      return {
        name: item.name,
        title: item.title,
        description: item.description,
        author: item.author ?? "Unknown",
        categories: item.categories ?? [],
        primaryCategory,
        broadCategory: getBroadCategory(primaryCategory),
        meta: {
          duration: item.meta?.duration ?? 0,
          sizeKb: item.meta?.sizeKb ?? 0,
          license: item.meta?.license ?? "Unknown",
          tags: item.meta?.tags ?? [],
          keywords:
            (item.meta as Record<string, unknown>)?.keywords as string[] ?? [],
        },
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  _index = new Map(_cache.map((s) => [s.name, s]));
}

/** Returns the full sorted catalog. Cached after first call within the same process. */
export function getAllSounds(): SoundCatalogItem[] {
  ensureCache();
  return _cache!;
}

/** O(1) lookup of a single sound by slug name. */
export function getSoundByName(name: string): SoundCatalogItem | undefined {
  ensureCache();
  return _index!.get(name);
}

/** Return sounds in the same broad category, excluding the given name. */
export function getRelatedSounds(
  name: string,
  broadCategory: string,
  limit = 8
): SoundCatalogItem[] {
  return getAllSounds()
    .filter((s) => s.broadCategory === broadCategory && s.name !== name)
    .slice(0, limit);
}
