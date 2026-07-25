"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Plus,
  RotateCcw,
  Shuffle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { BracketItem } from "@/data/types";
import { getBracketItemsAction } from "@/app/actions/bracket-items";
import { cn } from "@/lib/utils";

export interface TierListDataset {
  category: string;
  categoryName: string;
  slug: string;
  name: string;
  itemCount: number;
}

const TIERS = [
  { id: "S", label: "S", color: "#ff7f7f", note: "the best" },
  { id: "A", label: "A", color: "#ffbf7f", note: "great" },
  { id: "B", label: "B", color: "#ffff7f", note: "good" },
  { id: "C", label: "C", color: "#bfff7f", note: "fine" },
  { id: "D", label: "D", color: "#7fbfff", note: "weak" },
  { id: "F", label: "F", color: "#bf7fff", note: "no" },
] as const;

type TierId = (typeof TIERS)[number]["id"];
type Placement = Record<string, TierId | undefined>;

const TIER_IDS = TIERS.map((tier) => tier.id) as TierId[];
const UNPLACED = ".";
const STORAGE_PREFIX = "br:tierlist:v2:";
const STORAGE_LAST = "br:tierlist:v2:last";
const MAX_CUSTOM = 24;

function isTierId(value: string): value is TierId {
  return (TIER_IDS as string[]).includes(value);
}

/**
 * Compact placement encoding: one character per entrant, in the dataset's own
 * order, followed by one per custom entrant. Short enough to survive being
 * pasted into a chat window, and stable because the JSON datasets are ordered.
 */
function encodePlacement(ids: string[], placement: Placement) {
  return ids.map((id) => placement[id] ?? UNPLACED).join("");
}

function decodePlacement(ids: string[], encoded: string): Placement {
  const next: Placement = {};
  for (let index = 0; index < ids.length && index < encoded.length; index++) {
    const char = encoded[index];
    if (isTierId(char)) next[ids[index]] = char;
  }
  return next;
}

function customId(index: number) {
  return `custom-${index}`;
}

interface StoredState {
  t?: string;
  c?: string[];
}

interface TierListMakerProps {
  datasets: TierListDataset[];
  initialDataset: TierListDataset;
  initialItems: BracketItem[];
}

export function TierListMaker({
  datasets,
  initialDataset,
  initialItems,
}: TierListMakerProps) {
  const [dataset, setDataset] = useState<TierListDataset>(initialDataset);
  // Entrants in their canonical dataset order. Never reordered, so the share
  // encoding stays valid even after shuffling the display order.
  const [baseItems, setBaseItems] = useState<BracketItem[]>(initialItems);
  const [custom, setCustom] = useState<string[]>([]);
  const [order, setOrder] = useState<string[]>(() =>
    initialItems.map((item) => item.id),
  );
  const [placement, setPlacement] = useState<Placement>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  // The dataset being fetched. Without it the <select> would snap back to the
  // old list for as long as the round trip takes.
  const [pending, setPending] = useState<string | null>(null);
  const [copied, setCopied] = useState<"text" | "link" | null>(null);
  // Saving is held back until the restore pass has finished, otherwise the
  // first render would overwrite the visitor's stored list with an empty one.
  const [hydrated, setHydrated] = useState(false);
  const dragged = useRef<string | null>(null);
  const restored = useRef(false);

  const customItems = useMemo(
    () =>
      custom.map((name, index) => ({
        id: customId(index),
        name,
      })) satisfies BracketItem[],
    [custom],
  );

  const itemsById = useMemo(() => {
    const map = new Map<string, BracketItem>();
    for (const item of baseItems) map.set(item.id, item);
    for (const item of customItems) map.set(item.id, item);
    return map;
  }, [baseItems, customItems]);

  /** Canonical id order used for encoding: dataset items, then custom ones. */
  const encodeIds = useMemo(
    () => [
      ...baseItems.map((item) => item.id),
      ...customItems.map((item) => item.id),
    ],
    [baseItems, customItems],
  );

  /** Display order: shuffled dataset items followed by custom additions. */
  const items = useMemo(() => {
    const seen = new Set<string>();
    const list: BracketItem[] = [];
    for (const id of order) {
      const item = itemsById.get(id);
      if (item && !seen.has(id)) {
        seen.add(id);
        list.push(item);
      }
    }
    for (const item of baseItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    for (const item of customItems) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        list.push(item);
      }
    }
    return list;
  }, [order, itemsById, baseItems, customItems]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, TierListDataset[]>();
    for (const entry of datasets) {
      const list = byCategory.get(entry.categoryName) ?? [];
      list.push(entry);
      byCategory.set(entry.categoryName, list);
    }
    return Array.from(byCategory.entries());
  }, [datasets]);

  const pool = useMemo(
    () => items.filter((item) => !placement[item.id]),
    [items, placement],
  );

  const placeInTier = useCallback((itemId: string, tier: TierId | undefined) => {
    setPlacement((current) => {
      const next = { ...current };
      if (tier) next[itemId] = tier;
      else delete next[itemId];
      return next;
    });
    setSelected(null);
  }, []);

  const applyDataset = useCallback(
    (entry: TierListDataset, next: BracketItem[], stored?: StoredState) => {
      const customNames = (stored?.c ?? []).slice(0, MAX_CUSTOM);
      const ids = [
        ...next.map((item) => item.id),
        ...customNames.map((_, index) => customId(index)),
      ];
      setDataset(entry);
      setBaseItems(next);
      setCustom(customNames);
      setOrder(ids);
      setPlacement(stored?.t ? decodePlacement(ids, stored.t) : {});
      setSelected(null);
    },
    [],
  );

  const loadDataset = useCallback(
    async (value: string, stored?: StoredState) => {
      const [category, slug] = value.split("/");
      const entry = datasets.find(
        (item) => item.category === category && item.slug === slug,
      );
      if (!entry) return false;

      setLoading(true);
      setPending(value);
      try {
        const next = await getBracketItemsAction(category, slug);
        if (!next) {
          toast.error("Could not load that list. Try another one.");
          return false;
        }
        applyDataset(entry, next, stored);
        return true;
      } catch {
        toast.error("Could not load that list. Try another one.");
        return false;
      } finally {
        setLoading(false);
        setPending(null);
      }
    },
    [applyDataset, datasets],
  );

  // Restore a shared link, or the visitor's last session, once on mount. Doing
  // this in an effect rather than during render keeps the server HTML (which
  // carries the default list, and therefore the crawlable entrant names)
  // identical to the first client render.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const initialKey = `${initialDataset.category}/${initialDataset.slug}`;

    const readStored = (key: string): StoredState | undefined => {
      try {
        const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
        return raw ? (JSON.parse(raw) as StoredState) : undefined;
      } catch {
        return undefined;
      }
    };

    void (async () => {
      // Deep links use a fragment rather than a query string: `?d=…` would give
      // every template its own crawlable copy of this page, all of them
      // identical apart from the client-side state.
      const params = new URLSearchParams(
        window.location.hash.replace(/^#/, "") ||
          window.location.search.replace(/^\?/, ""),
      );
      const shared = params.get("d");

      if (shared) {
        const sharedCustom = params.get("c");
        const stored: StoredState = {
          t: params.get("t") ?? undefined,
          c: sharedCustom ? sharedCustom.split("~").filter(Boolean) : undefined,
        };
        if (shared === initialKey) {
          applyDataset(initialDataset, initialItems, stored);
        } else {
          await loadDataset(shared, stored);
        }
      } else {
        let last: string | null = null;
        try {
          last = window.localStorage.getItem(STORAGE_LAST);
        } catch {
          last = null;
        }
        const target = last ?? initialKey;
        const stored = readStored(target);
        if (stored) {
          if (target === initialKey) {
            applyDataset(initialDataset, initialItems, stored);
          } else {
            await loadDataset(target, stored);
          }
        } else if (last && last !== initialKey) {
          await loadDataset(last);
        }
      }

      // Deliberately unconditional: a cleanup-based guard would suppress this
      // on React's development double-invoke (the ref short-circuits the second
      // run) and saving would never switch on.
      setHydrated(true);
    })();
  }, [applyDataset, initialDataset, initialItems, loadDataset]);

  // Persist after every change so a refresh, a closed tab or a dead battery
  // does not lose the list.
  useEffect(() => {
    if (!hydrated) return;
    const key = `${dataset.category}/${dataset.slug}`;
    const encoded = encodePlacement(encodeIds, placement);
    const empty = !encoded.replace(/\./g, "") && custom.length === 0;
    try {
      window.localStorage.setItem(STORAGE_LAST, key);
      if (empty) {
        window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
      } else {
        window.localStorage.setItem(
          `${STORAGE_PREFIX}${key}`,
          JSON.stringify({ t: encoded, c: custom } satisfies StoredState),
        );
      }
    } catch {
      // Private browsing or a full quota: the tool still works in-memory.
    }
  }, [custom, dataset.category, dataset.slug, encodeIds, hydrated, placement]);

  const handleSelectDataset = useCallback(
    (value: string) => {
      let stored: StoredState | undefined;
      try {
        const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${value}`);
        if (raw) stored = JSON.parse(raw) as StoredState;
      } catch {
        stored = undefined;
      }
      void loadDataset(value, stored);
    },
    [loadDataset],
  );

  const reset = useCallback(() => {
    setPlacement({});
    setSelected(null);
  }, []);

  const shuffleRemaining = useCallback(() => {
    setOrder((current) => {
      const copy = [...current];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
  }, []);

  const addCustom = useCallback(() => {
    const name = draft.trim().slice(0, 60);
    if (!name) return;
    if (custom.length >= MAX_CUSTOM) {
      toast.error(`You can add up to ${MAX_CUSTOM} of your own entries.`);
      return;
    }
    setCustom((current) => [...current, name]);
    setOrder((current) => [...current, customId(custom.length)]);
    setDraft("");
  }, [custom.length, draft]);

  const removeCustom = useCallback((index: number) => {
    // Ids are positional, so drop the placement for the removed entry and
    // shift everything above it down by one.
    setCustom((current) => current.filter((_, i) => i !== index));
    setPlacement((current) => {
      const next: Placement = {};
      for (const [id, tier] of Object.entries(current)) {
        const match = /^custom-(\d+)$/.exec(id);
        if (!match) {
          next[id] = tier;
          continue;
        }
        const position = Number(match[1]);
        if (position === index) continue;
        next[customId(position > index ? position - 1 : position)] = tier;
      }
      return next;
    });
    setOrder((current) =>
      current
        .filter((id) => id !== customId(index))
        .map((id) => {
          const match = /^custom-(\d+)$/.exec(id);
          if (!match) return id;
          const position = Number(match[1]);
          return position > index ? customId(position - 1) : id;
        }),
    );
  }, []);

  const asText = useCallback(() => {
    const lines = [`${dataset.name} tier list`];
    for (const tier of TIERS) {
      const names = items
        .filter((item) => placement[item.id] === tier.id)
        .map((item) => item.name);
      if (names.length > 0) lines.push(`${tier.label}: ${names.join(", ")}`);
    }
    const left = pool.map((item) => item.name);
    if (left.length > 0 && left.length < items.length) {
      lines.push(`Unranked: ${left.join(", ")}`);
    }
    lines.push("made with bracketranker.com/tier-list-maker");
    return lines.join("\n");
  }, [dataset.name, items, placement, pool]);

  const shareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("d", `${dataset.category}/${dataset.slug}`);
    params.set("t", encodePlacement(encodeIds, placement));
    if (custom.length > 0) params.set("c", custom.join("~"));
    return `${window.location.origin}/tier-list-maker#${params.toString()}`;
  }, [custom, dataset.category, dataset.slug, encodeIds, placement]);

  const writeClipboard = useCallback(
    async (value: string, kind: "text" | "link", message: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(kind);
        toast.success(message);
      } catch {
        toast.error("Copying is not available in this browser");
      }
    },
    [],
  );

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const placedCount = items.length - pool.length;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <label className="flex-1">
          <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
            What are you ranking?
          </span>
          <select
            value={pending ?? `${dataset.category}/${dataset.slug}`}
            onChange={(event) => handleSelectDataset(event.target.value)}
            disabled={loading}
            aria-label="Choose a tier list template"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {grouped.map(([categoryName, entries]) => (
              <optgroup key={categoryName} label={categoryName}>
                {entries.map((entry) => (
                  <option
                    key={`${entry.category}/${entry.slug}`}
                    value={`${entry.category}/${entry.slug}`}
                  >
                    {entry.name} ({entry.itemCount})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shuffleRemaining}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Shuffle className="size-4" />
            Shuffle
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() =>
              void writeClipboard(
                shareUrl(),
                "link",
                "Share link copied — it reopens this exact tier list",
              )
            }
            disabled={placedCount === 0}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            {copied === "link" ? (
              <Check className="size-4" />
            ) : (
              <Link2 className="size-4" />
            )}
            Share link
          </button>
          <button
            type="button"
            onClick={() =>
              void writeClipboard(
                asText(),
                "text",
                "Tier list copied as text",
              )
            }
            disabled={placedCount === 0}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {copied === "text" ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            Copy
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {selected
          ? "Now tap a tier row to drop it in."
          : `Tap an entry below, then tap a tier — or drag it with a mouse. ${placedCount} of ${items.length} placed.`}
      </p>

      {/* Tier rows */}
      <div className="overflow-hidden rounded-xl border border-border">
        {TIERS.map((tier) => {
          const tierItems = items.filter(
            (item) => placement[item.id] === tier.id,
          );
          const place = () => {
            if (selected) placeInTier(selected, tier.id);
          };
          return (
            <div
              key={tier.id}
              className="flex border-b border-border last:border-b-0"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const id = dragged.current ?? selected;
                if (id) placeInTier(id, tier.id);
                dragged.current = null;
              }}
            >
              <button
                type="button"
                onClick={place}
                aria-label={`Put the selected entry in tier ${tier.label}`}
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 text-2xl font-black text-black sm:w-20",
                  selected && "cursor-pointer ring-2 ring-inset ring-white",
                )}
                style={{ backgroundColor: tier.color }}
              >
                {tier.label}
                <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                  {tier.note}
                </span>
              </button>

              <div
                onClick={place}
                className={cn(
                  "flex min-h-[76px] flex-1 flex-wrap content-start gap-2 bg-card p-2",
                  selected && "cursor-pointer bg-secondary/60",
                )}
              >
                {tierItems.map((item) => (
                  <TierTile
                    key={item.id}
                    item={item}
                    onClick={(event) => {
                      // With something selected, let the click bubble so the
                      // row places it instead of emptying this slot.
                      if (selected) return;
                      event.stopPropagation();
                      placeInTier(item.id, undefined);
                    }}
                    onDragStart={() => {
                      dragged.current = item.id;
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unranked pool */}
      <div
        className="rounded-xl border border-border bg-card p-3"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const id = dragged.current;
          if (id) placeInTier(id, undefined);
          dragged.current = null;
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Unranked ({pool.length})
          </h3>
          {loading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </div>
        {pool.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Everything is placed. Want a second opinion?{" "}
            <Link
              href={`/${dataset.category}/${dataset.slug}`}
              className="font-semibold underline underline-offset-2"
            >
              Play the {dataset.name} bracket
            </Link>{" "}
            and see whether the head-to-head order matches.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {pool.map((item) => (
              <TierTile
                key={item.id}
                item={item}
                selected={selected === item.id}
                onClick={() =>
                  setSelected((current) =>
                    current === item.id ? null : item.id,
                  )
                }
                onDragStart={() => {
                  dragged.current = item.id;
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom entries */}
      <div className="rounded-xl border border-border bg-card p-3">
        <h3 className="mb-2 text-sm font-semibold text-white">
          Add your own
        </h3>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            maxLength={60}
            placeholder="Something the list is missing"
            aria-label="Name of your own entry"
            className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
        {custom.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {custom.map((name, index) => (
              <li
                key={`${name}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs text-white"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeCustom(index)}
                  aria-label={`Remove ${name}`}
                  className="text-muted-foreground transition-colors hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface TierTileProps {
  item: BracketItem;
  selected?: boolean;
  onClick: (event: React.MouseEvent) => void;
  onDragStart: () => void;
}

function TierTile({ item, selected, onClick, onDragStart }: TierTileProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={item.name}
      className={cn(
        "relative flex size-16 shrink-0 touch-manipulation flex-col items-center justify-end overflow-hidden rounded-md bg-secondary text-[10px] font-semibold leading-tight text-white transition-transform hover:scale-105 sm:size-[72px]",
        selected && "ring-2 ring-white",
      )}
    >
      {item.image && (
        <Image
          src={item.image}
          alt=""
          fill
          className="object-cover"
          sizes="72px"
        />
      )}
      <span
        className="relative z-10 w-full px-1 pb-1 text-center"
        style={{
          textShadow: "0 1px 3px rgba(0,0,0,0.9)",
          background: item.image
            ? "linear-gradient(to top, rgba(0,0,0,0.85), transparent)"
            : undefined,
        }}
      >
        {item.name.length > 22 ? `${item.name.slice(0, 21)}…` : item.name}
      </span>
    </button>
  );
}
