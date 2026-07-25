import type { BracketCategory, BracketItem, BracketMeta } from "@/data/types";
import { brackets } from "@/data/registry";
import { bracketTargets } from "@/data/bracket-targets";
import { getRoundName, maxBracketSize } from "@/lib/bracket-engine";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";

export interface Faq {
  question: string;
  answer: string;
}

export interface BracketSeo {
  title: string;
  description: string;
  /** Page H1. Carries the primary keyword. */
  heading: string;
  /** Supporting line under the H1. */
  subheading: string;
  intro: string;
  method: string;
  itemSummary: string;
  tips: string[];
  faqs: Faq[];
  /** Round names for the default bracket size, e.g. ["Round of 32", …]. */
  rounds: string[];
  /** Bracket sizes this item pool can actually fill. */
  sizes: number[];
  /** Picks required at the default size. */
  picks: number;
  /** Rough minutes to finish at the default size. */
  minutes: string;
}

/** Plural noun used when talking about what a category's brackets contain. */
const categoryNoun: Record<string, { one: string; many: string }> = {
  movies: { one: "film", many: "films" },
  music: { one: "track", many: "tracks" },
  tv: { one: "show", many: "shows" },
  food: { one: "pick", many: "picks" },
  sports: { one: "contender", many: "contenders" },
  random: { one: "option", many: "options" },
};

/** How each category talks about the deciding factor, used in tips. */
const categoryTip: Record<string, string> = {
  movies:
    "Pick the film you would actually rewatch tonight, not the one with the better reputation.",
  music:
    "Go with the track you would rather hear right now — instant reaction beats a considered take.",
  tv: "Judge the whole run, not just the best season, or every prestige show wins by default.",
  food: "Answer as if both options were in front of you and you could only eat one.",
  sports:
    "Decide your criteria before you start — peak, longevity or trophies — and hold to it all the way through.",
  random:
    "Trust the first instinct. Overthinking a matchup usually produces a ranking you do not agree with later.",
};

export function bracketKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

/** Stable small integer from a string, used to vary copy per bracket. */
function seedFrom(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Deterministically picks one phrasing so sibling pages do not share copy. */
function pick<T>(variants: T[], seed: number, offset = 0): T {
  return variants[(seed + offset) % variants.length];
}

/** Bracket sizes this pool of items can actually fill, largest first. */
export function playableSizes(itemCount: number): number[] {
  return [8, 16, 32, 64].filter((size) => size <= maxBracketSize(itemCount));
}

/** Round names for a completed bracket of the given size. */
export function roundNamesFor(size: number): string[] {
  const count = Math.max(0, Math.round(Math.log2(size)));
  return Array.from({ length: count }, (_, index) => getRoundName(size, index));
}

function playableDefaultSize(meta: BracketMeta) {
  return Math.min(meta.defaultSize, maxBracketSize(meta.itemCount)) || 8;
}

function estimateMinutes(picks: number) {
  // Roughly four to six seconds per matchup in practice.
  const low = Math.max(1, Math.round((picks * 4) / 60));
  const high = Math.max(low + 1, Math.round((picks * 7) / 60));
  return `${low}-${high} minutes`;
}

function listOf(names: string[], max: number) {
  const shown = names.slice(0, max);
  if (shown.length <= 1) return shown[0] ?? "";
  return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
}

/**
 * Fall back to a sensible target for any bracket that is not in the hand-written
 * table (for example a bracket added to the registry before its copy is written).
 */
function fallbackTarget(meta: BracketMeta, category?: BracketCategory) {
  return {
    keyword: `${meta.name.toLowerCase()} tier list`,
    title: `${meta.name} Tier List`,
    description: `${meta.description}. Rank ${meta.itemCount} ${
      categoryNoun[meta.category]?.many ?? "options"
    } head-to-head and share your final order.`,
    variants: [`rank ${meta.name.toLowerCase()}`],
    related: undefined as string[] | undefined,
    categoryName: category?.name,
  };
}

function targetFor(meta: BracketMeta, category?: BracketCategory) {
  return (
    bracketTargets[bracketKey(meta.category, meta.slug)] ??
    fallbackTarget(meta, category)
  );
}

export function getBracketTitle(meta: BracketMeta, category?: BracketCategory) {
  return targetFor(meta, category).title;
}

export function getBracketDescription(
  meta: BracketMeta,
  category?: BracketCategory,
) {
  return targetFor(meta, category).description;
}

export function getBracketKeyword(
  meta: BracketMeta,
  category?: BracketCategory,
) {
  return targetFor(meta, category).keyword;
}

// ---------------------------------------------------------------------------
// Per-bracket copy, generated from the bracket's own data
// ---------------------------------------------------------------------------

/**
 * Builds the on-page copy for a bracket.
 *
 * Everything here is derived from the bracket's real contents — its entrants,
 * item count, playable sizes and round names — so no two pages share a
 * paragraph, an FAQ answer or a list of examples.
 */
export function getBracketSeo(
  meta: BracketMeta,
  category: BracketCategory | undefined,
  items: BracketItem[],
): BracketSeo {
  const target = targetFor(meta, category);
  const keyword = target.keyword;
  const seed = seedFrom(bracketKey(meta.category, meta.slug));
  const noun = categoryNoun[meta.category] ?? { one: "option", many: "options" };
  const size = playableDefaultSize(meta);
  const picks = size - 1;
  const rounds = roundNamesFor(size);
  const sizes = playableSizes(items.length || meta.itemCount);
  const names = items.map((item) => item.name);
  const minutes = estimateMinutes(picks);

  // Real entrants, used to make every page's examples different.
  const [a, b, c, d] = names;
  const headlineExamples = listOf(names, 4);

  // The H1 is the targeted title verbatim: it is already written short and
  // keyword-first, and a second phrasing would only compete with it.
  const heading = target.title;

  const subheading = `Rank ${items.length} ${noun.many} in ${picks} head-to-head picks. Free, no account, works on mobile.`;

  const introClose = pick(
    [
      `Comparing two ${noun.many} is far easier than sorting ${items.length} of them at once, which is why the finished list tends to survive a second look.`,
      `Nobody can hold ${items.length} ${noun.many} in their head at once, but everybody can answer "this one" — so the order you end up with is one you will actually stand behind.`,
      `A straight list invites you to hedge. A matchup does not, and that is what makes the final ${items.length}-deep order worth screenshotting.`,
      `The awkward pairings are the point: they are the calls a drag-and-drop tier list quietly lets you avoid.`,
      `By the end you have ranked all ${items.length} without ever having to look at more than two at a time.`,
    ],
    seed,
  );

  const intro =
    `${keyword[0].toUpperCase()}${keyword.slice(1)} without dragging anything into rows. ` +
    `You get one matchup at a time — ${a ?? "the first entrant"} or ${b ?? "the second"}? ` +
    `${c ?? "This"} or ${d ?? "that"}? — and after ${picks} picks the bracket has a winner and a full ranked order underneath it. ` +
    introClose;

  const shuffleNote = pick(
    [
      `The field is reshuffled on every play, so the same ${noun.one} can meet a different opponent in round one and finish somewhere else entirely.`,
      `Seeding is random, which means a replay is a genuinely different bracket rather than the same path twice.`,
      `Entrants are drawn at random each time, so an early upset in one run may never happen in the next.`,
      `Because the draw is shuffled, two people playing the same bracket rarely face the same matchups.`,
    ],
    seed,
    1,
  );

  const method =
    `This bracket runs ${rounds.length} rounds at the default ${size}-slot size (${rounds.join(", ")}), ` +
    `drawn from a pool of ${items.length} ${noun.many}. ` +
    shuffleNote +
    (sizes.length > 1
      ? ` You can also play it at ${sizes
          .filter((s) => s !== size)
          .join(" or ")} slots for a shorter or longer run.`
      : ``);

  const itemSummary = `All ${items.length} entrants are listed below, including ${headlineExamples}.`;

  const tips = [
    categoryTip[meta.category] ??
      "Trust the first instinct — overthinking a matchup usually produces a ranking you disagree with later.",
    sizes.length > 1
      ? `Start at ${size} slots. If the result feels too obvious, replay at ${Math.max(
          ...sizes,
        )} so more of the ${items.length} ${noun.many} make the field.`
      : `Replay it — the shuffle changes which ${noun.many} meet early, and close calls in round one change the whole ranking.`,
    pick(
      [
        `Use undo the moment you regret a pick. One reflex answer in an early round can knock out a favourite before it gets going.`,
        `Undo exists for a reason: an early-round mistake propagates all the way to the final, and there is no shame in taking it back.`,
        `If a matchup genuinely splits you, undo and replay it — a coin-flip pick in round one distorts everything below it.`,
        `Watch for the ${noun.one} you keep beating reluctantly. That is usually the sign you should undo and reconsider the pick before it.`,
      ],
      seed,
      2,
    ),
  ];

  const faqs: Faq[] = [
    {
      question: `How many ${noun.many} are in the ${meta.name} bracket?`,
      answer:
        `The pool holds ${items.length} ${noun.many}. A default run uses ${size} of them and takes ${picks} picks across ${rounds.length} rounds: ${rounds.join(
          ", ",
        )}. ` +
        (sizes.length > 1
          ? `Smaller and larger fields are available too — ${sizes.join(", ")} slots.`
          : ``),
    },
    {
      question: `Which ${noun.many} are included?`,
      answer: `${listOf(names, 12)}${
        names.length > 12 ? `, plus ${names.length - 12} more` : ""
      }. Every entrant is listed further down this page with its artwork.`,
    },
    {
      question: `How long does the ${keyword} take?`,
      answer:
        `About ${minutes} — ${picks} choices at the default size${
          sizes.length > 1
            ? `, or ${Math.min(...sizes) - 1} if you drop to a ${Math.min(
                ...sizes,
              )}-slot bracket`
            : ""
        }. ` +
        pick(
          [
            `There is no sign-up and nothing is stored until you reach the final.`,
            `No account is needed, and you can abandon a run at any point without losing anything.`,
            `It works the same on a phone as on a desktop, and no login is involved.`,
          ],
          seed,
          6,
        ),
    },
    {
      question: pick(
        [
          `Is this a ${meta.name.toLowerCase()} tier list or a ranking?`,
          `Can I turn the result into S/A/B tiers?`,
          `How does this compare to a drag-and-drop tier list maker?`,
        ],
        seed,
        3,
      ),
      answer: `Both are here. The bracket finishes with a full 1-to-${size} order rather than S/A/B/C buckets, so you can cut it into tiers wherever the gaps look right — and because the order came out of ${picks} direct comparisons rather than your first guess at a layout, those cut points are easier to justify. If you would rather place the ${noun.many} into tiers directly, the tier list maker loads all ${items.length} of them into S through F rows at bracketranker.com/tier-list-maker.`,
    },
    {
      question: pick(
        [
          `How did everyone else rank these ${noun.many}?`,
          `Is there a community ${meta.name.toLowerCase()} ranking?`,
          `Can I compare my order with other people's?`,
        ],
        seed,
        4,
      ),
      answer: `Every completed bracket feeds the ${meta.name} community results page, which aggregates win rates across all plays and tracks how often each of the ${items.length} entrants takes the title. It updates continuously, so it moves as more people play.`,
    },
    {
      question: pick(
        [
          `What if a ${noun.one} I wanted is missing?`,
          `Can I build my own ${meta.name.toLowerCase()} bracket?`,
          `Can I change which ${noun.many} are included?`,
        ],
        seed,
        5,
      ),
      answer: `Use the bracket maker: add your own ${noun.many}, name it, and share the link so other people play the same field. That is the route to take when this pool of ${items.length} is missing something you would have picked, or when you want a version scoped to one era, label or franchise.`,
    },
  ];

  return {
    title: target.title,
    description: target.description,
    heading,
    subheading,
    intro,
    method,
    itemSummary,
    tips,
    faqs,
    rounds,
    sizes,
    picks,
    minutes,
  };
}

export function getRelatedBrackets(meta: BracketMeta, limit = 8) {
  const wanted = bracketTargets[bracketKey(meta.category, meta.slug)]?.related ?? [];
  const picked = new Map<string, BracketMeta>();

  for (const key of wanted) {
    const related = brackets.find(
      (item) => bracketKey(item.category, item.slug) === key,
    );
    if (related && related !== meta) picked.set(key, related);
  }

  for (const related of brackets) {
    if (picked.size >= limit) break;
    if (related.category !== meta.category || related.slug === meta.slug) continue;
    picked.set(bracketKey(related.category, related.slug), related);
  }

  for (const related of brackets) {
    if (picked.size >= limit) break;
    if (related.slug === meta.slug || !related.featured) continue;
    picked.set(bracketKey(related.category, related.slug), related);
  }

  return Array.from(picked.values()).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Category hubs
// ---------------------------------------------------------------------------

const categoryKeywords: Record<
  string,
  {
    keyword: string;
    title: string;
    description: string;
    heading: string;
    intro: string;
  }
> = {
  movies: {
    keyword: "movie tier list",
    title: "Movie Tier Lists & Ranking Brackets",
    description:
      "Rank Marvel, Pixar, Disney, horror, sci-fi and Oscar films head-to-head. 20 movie tier lists, each one a playable bracket with real posters.",
    heading: "Movie tier lists you play instead of drag",
    intro:
      "Every movie bracket here works the same way: two films, one pick, repeat until a champion is left and a full ranking falls out underneath. It beats a drag-and-drop tier list for the same reason a knockout beats a league table — you are only ever judging one pair at a time.",
  },
  music: {
    keyword: "song sorter",
    title: "Song Sorters & Music Tier Lists",
    description:
      "Sort songs, albums and artists into a personal ranking. Taylor Swift, Drake, the Beatles, rap albums, classic rock and 25 more music brackets.",
    heading: "Song sorters for rankings you can defend",
    intro:
      "A song sorter asks one question at a time: this track or that one? After a few dozen answers you have an ordered list that came from actual choices rather than a first-draft guess. Pick an artist, a decade or a mood below and start sorting.",
  },
  tv: {
    keyword: "TV show tier list",
    title: "TV Show Tier Lists: Sitcoms, Anime & More",
    description:
      "Rank TV shows head-to-head — anime, sitcoms, Netflix originals, prestige dramas, reality, crime and cartoons. 15 playable TV tier lists.",
    heading: "TV tier lists decided by matchups",
    intro:
      "Sitcoms against sitcoms, anime against anime, and prestige dramas against each other with nowhere to hide. Each bracket takes a few minutes and ends with a ranked list you can screenshot and argue about.",
  },
  food: {
    keyword: "food tier list",
    title: "Food Tier Lists: Fast Food, Snacks & Candy",
    description:
      "Make a food tier list the honest way. Fast food chains, pizza toppings, snacks, candy, cereal, desserts and 20 more head-to-head food brackets.",
    heading: "Food tier lists you cannot fudge",
    intro:
      "Food rankings collapse the moment everything gets an A tier. These brackets force the awkward calls — the chain you defend against the one you actually drive to, the topping you order against the one you claim to like — until only one is left.",
  },
  sports: {
    keyword: "sports tier list",
    title: "Sports Tier Lists & GOAT Brackets",
    description:
      "Rank NBA players, NFL teams, soccer stars, tennis greats and all-time athletes head-to-head. 15 sports brackets built for GOAT arguments.",
    heading: "GOAT brackets and sports tier lists",
    intro:
      "Every GOAT argument is really a series of head-to-heads that nobody bothers to run. These brackets run them. Pick a sport, decide whether you are rewarding peak, longevity or trophies, then hold that line for 31 matchups.",
  },
  random: {
    keyword: "tier list ideas",
    title: "Tier List Ideas: Games, Dogs, Emoji & More",
    description:
      "Rank anything: video games, dog breeds, superpowers, emoji, cities, board games, car brands, holidays and more. 15 head-to-head tier lists.",
    heading: "Tier list ideas for everything else",
    intro:
      "The topics that do not fit a neat category but start the best arguments — video games, dog breeds, superpowers, emoji, decades, phobias. Pick one and let the bracket settle it.",
  },
};

export function getCategorySeo(category: BracketCategory, count: number) {
  const seo = categoryKeywords[category.slug];
  return {
    keyword: seo?.keyword ?? `${category.name.toLowerCase()} tier list`,
    title: seo?.title ?? `${category.name} Tier Lists & Ranking Brackets`,
    description:
      seo?.description ??
      `Rank the best ${category.name.toLowerCase()} with ${count} head-to-head brackets. Pick winners, get a full ranking, and share it.`,
    heading: seo?.heading ?? `${category.name} tier lists and ranking brackets`,
    intro:
      seo?.intro ??
      `Choose from ${count} ${category.name.toLowerCase()} brackets and build a final ranking through head-to-head matchups.`,
  };
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildItemListJsonLd(
  name: string,
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
    })),
  };
}

/** ItemList for the entrants inside a bracket (names only, no URLs). */
export function buildEntrantListJsonLd(
  name: string,
  path: string,
  items: BracketItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: absoluteUrl(path),
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

export function buildFaqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildBracketSoftwareJsonLd(
  meta: BracketMeta,
  seo: BracketSeo,
  path: string,
  plays?: number,
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: seo.title,
    applicationCategory: "GameApplication",
    browserRequirements: "Requires JavaScript",
    operatingSystem: "Web",
    url: absoluteUrl(path),
    description: seo.description,
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(plays && plays > 0
      ? {
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/PlayAction",
            userInteractionCount: plays,
          },
        }
      : {}),
  };
}

export function buildSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "BracketRanker",
      alternateName: SITE_NAME,
      applicationCategory: "GameApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      description:
        "Head-to-head ranking brackets and tier lists for movies, music, TV, food, sports and games. Pick a winner in every matchup and get a full ranking.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      url: SITE_URL,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description:
        "Rank anything head-to-head: tier lists, song sorters and ranking brackets with community results.",
    },
  ];
}
