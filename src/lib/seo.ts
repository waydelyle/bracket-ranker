import type { BracketCategory, BracketItem, BracketMeta } from "@/data/types";
import { brackets } from "@/data/registry";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";

export interface Faq {
  question: string;
  answer: string;
}

export interface BracketSeo {
  primaryKeyword: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  itemSummary: string;
  tips: string[];
  faqs: Faq[];
}

interface BracketSeoOverride {
  primaryKeyword: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  tips?: string[];
  faqs?: Faq[];
  related?: string[];
}

const bracketOverrides: Record<string, BracketSeoOverride> = {
  "food/fast-food": {
    primaryKeyword: "fast food tier list",
    title: "Fast Food Tier List - Rank the Best Chains",
    description:
      "Build a fast food tier list with a head-to-head bracket for McDonald's, Chick-fil-A, In-N-Out, Wendy's, Taco Bell, and more.",
    heading: "Build a fast food tier list from real matchups",
    intro:
      "Use this fast food ranking bracket when a simple drag-and-drop list feels too easy to second-guess. Every pick is a head-to-head choice, so your final tier list reflects the chains you actually choose under pressure.",
    related: [
      "food/fast-food-burgers",
      "food/pizza-chains",
      "food/snacks",
      "food/pizza-toppings",
      "food/comfort-foods",
    ],
  },
  "music/taylor-swift": {
    primaryKeyword: "rank Taylor Swift songs",
    title: "Rank Taylor Swift Songs - Eras Bracket",
    description:
      "Rank Taylor Swift songs from every era in a 64-song bracket, from All Too Well and Love Story to Cruel Summer and Anti-Hero.",
    heading: "Rank Taylor Swift songs across every era",
    intro:
      "Start a Taylor Swift song ranking that forces the hard choices: album cuts against singles, country-era favorites against synth-pop hits, and folklore or evermore deep cuts against stadium anthems.",
    related: [
      "music/pop-hits-2010s",
      "music/love-songs",
      "music/breakup-songs",
      "music/2020s-hits",
      "music/karaoke-songs",
    ],
  },
  "movies/marvel": {
    primaryKeyword: "rank Marvel movies",
    title: "Rank Marvel Movies - MCU Bracket",
    description:
      "Rank Marvel movies in a 32-film MCU bracket, including Iron Man, The Avengers, Black Panther, Endgame, Guardians, and more.",
    heading: "Rank Marvel movies with a full MCU bracket",
    intro:
      "Use this MCU bracket to rank Marvel movies by direct matchups instead of arguing over one long list. It is built for replayable debates over origin stories, Avengers events, sequels, and multiverse entries.",
    related: [
      "movies/superhero",
      "random/marvel-characters",
      "movies/franchise",
      "movies/action",
      "movies/scifi",
    ],
  },
  "movies/pixar": {
    primaryKeyword: "rank Pixar movies",
    title: "Rank Pixar Movies - Pixar Film Bracket",
    description:
      "Rank Pixar movies from Toy Story and Finding Nemo to Inside Out 2 in a head-to-head movie ranking bracket.",
    heading: "Rank Pixar movies from Toy Story to Inside Out 2",
    intro:
      "This Pixar ranking bracket turns the usual best Pixar movie debate into a clean series of matchups. Pick between classics, sequels, emotional favorites, and recent releases until one film wins.",
    related: [
      "movies/disney",
      "movies/animated",
      "movies/studio-ghibli",
      "random/disney-characters",
      "movies/2020s",
    ],
  },
  "food/pizza-toppings": {
    primaryKeyword: "pizza toppings tier list",
    title: "Pizza Toppings Tier List - Ranking Bracket",
    description:
      "Make a pizza toppings tier list with head-to-head matchups for pepperoni, mushrooms, extra cheese, pineapple, jalapenos, and more.",
    heading: "Settle your pizza toppings tier list",
    intro:
      "This pizza toppings ranking bracket is made for the toppings people actually argue over. Choose between classics, vegetables, meats, spice, and the controversial sweet options until your top topping is clear.",
    related: [
      "food/pizza-chains",
      "food/fast-food",
      "food/condiments",
      "food/snacks",
      "food/comfort-foods",
    ],
  },
  "sports/nba-players": {
    primaryKeyword: "rank NBA players",
    title: "Rank NBA Players - All-Time Basketball Bracket",
    description:
      "Rank NBA players in a 32-player basketball bracket and compare your all-time favorites through head-to-head matchups.",
    heading: "Rank NBA players in an all-time bracket",
    intro:
      "Build your NBA player ranking one matchup at a time. The bracket format keeps every pick focused, whether you value rings, peak dominance, longevity, skill, impact, or personal favorites.",
    related: [
      "sports/nba-teams",
      "sports/athletes-goat",
      "sports/soccer-players",
      "sports/nfl-teams",
      "sports/tennis-players",
    ],
  },
  "tv/anime": {
    primaryKeyword: "anime ranking",
    title: "Anime Ranking Bracket - Rank the Best Series",
    description:
      "Create an anime ranking with head-to-head matchups across classic, modern, action, fantasy, and drama anime series.",
    heading: "Make an anime ranking without endless reshuffling",
    intro:
      "Use this anime bracket to compare series directly instead of moving names around a long list. Each matchup narrows the field until your personal anime ranking is ready to share.",
    related: [
      "tv/animated-shows",
      "movies/studio-ghibli",
      "random/video-games",
      "tv/sci-fi-tv",
      "tv/drama",
    ],
  },
  "random/video-games": {
    primaryKeyword: "rank video games",
    title: "Rank Video Games - Greatest Games Bracket",
    description:
      "Rank video games in a 32-game bracket covering classics, modern hits, console favorites, and PC games.",
    heading: "Rank video games through head-to-head choices",
    intro:
      "This video game ranking bracket is built for deciding between favorites from different eras and platforms. Pick the game you would rather replay, recommend, or call the greatest.",
    related: [
      "sports/esports-games",
      "random/board-games",
      "tv/anime",
      "random/social-media",
      "random/inventions",
    ],
  },
  "random/dog-breeds": {
    primaryKeyword: "dog breed ranking",
    title: "Dog Breed Ranking Bracket - Pick Your Favorite Breeds",
    description:
      "Make a dog breed ranking with Golden Retrievers, Labradors, German Shepherds, French Bulldogs, Corgis, Huskies, and more.",
    heading: "Build a dog breed ranking from head-to-head picks",
    intro:
      "Use this dog breed bracket for a personal favorite-breed ranking. Compare temperament, looks, energy, size, and the dogs you would most want to live with.",
    related: [
      "random/cities",
      "random/superpowers",
      "food/comfort-foods",
      "random/board-games",
      "random/car-brands",
    ],
  },
  "tv/sitcoms": {
    primaryKeyword: "sitcom tier list",
    title: "Sitcom Tier List - Rank the Best Comedy Shows",
    description:
      "Make a sitcom tier list with a bracket for classic and modern comedy shows, from Friends and The Office to newer favorites.",
    heading: "Turn a sitcom tier list into decisive matchups",
    intro:
      "This sitcom ranking bracket helps you compare comfort rewatches, workplace comedies, family shows, and ensemble casts without getting stuck rearranging tiers.",
    related: [
      "tv/90s-tv",
      "tv/2000s-tv",
      "tv/animated-shows",
      "tv/game-shows",
      "movies/comedy",
    ],
  },
};

const categoryKeywords: Record<
  string,
  { title: string; description: string; heading: string; intro: string }
> = {
  movies: {
    title: "Movie Ranking Brackets - Rank Marvel, Pixar, Disney and More",
    description:
      "Play movie ranking brackets for Marvel, Pixar, Disney, horror, action, comedy, Oscar winners, and more.",
    heading: "Movie ranking brackets for every kind of film debate",
    intro:
      "Pick a movie bracket, choose winners head-to-head, and turn your opinions into a final top list. These pages are built for movie rankings, best-of debates, and shareable bracket challenges.",
  },
  music: {
    title: "Song Bracket Maker - Rank Songs, Artists and Albums",
    description:
      "Rank songs, artists, albums, pop hits, breakup songs, Taylor Swift songs, Drake songs, Beatles songs, and more.",
    heading: "Song brackets for rankings that are hard to fake",
    intro:
      "Use the music brackets when you want a cleaner way to rank songs, albums, artists, and eras. Every round turns taste into a direct choice, making the final ranking easier to defend.",
  },
  tv: {
    title: "TV Show Rankings - Sitcom, Anime, Netflix and Drama Brackets",
    description:
      "Rank TV shows with brackets for sitcoms, anime, Netflix originals, dramas, reality shows, crime shows, and more.",
    heading: "TV show ranking brackets for binge-watch debates",
    intro:
      "Browse TV brackets for sitcoms, anime, dramas, streaming originals, reality shows, and older favorites. Pick your winners and see which show survives the full bracket.",
  },
  food: {
    title: "Food Tier List Brackets - Rank Fast Food, Pizza and Snacks",
    description:
      "Make food tier lists and ranking brackets for fast food chains, pizza toppings, snacks, candy, desserts, burgers, and more.",
    heading: "Food tier list brackets for taste-test arguments",
    intro:
      "Food rankings work best when every choice is specific. Use these brackets to compare fast food chains, pizza toppings, snacks, desserts, drinks, and comfort foods one matchup at a time.",
  },
  sports: {
    title: "Sports Rankings - Rank Players, Teams and Athletes",
    description:
      "Rank NBA players, NFL teams, soccer players, athletes, tennis players, stadiums, esports games, and more.",
    heading: "Sports ranking brackets for teams, players, and GOAT debates",
    intro:
      "Start a sports bracket when you want to compare players, teams, athletes, stadiums, and games directly. The format makes every ranking choice explicit.",
  },
  random: {
    title: "Ranking Ideas - Brackets for Games, Dog Breeds and More",
    description:
      "Find fun ranking ideas for video games, dog breeds, board games, cities, car brands, social media platforms, holidays, and more.",
    heading: "Ranking ideas for anything worth debating",
    intro:
      "Use these brackets for topics that do not fit one category: video games, dog breeds, cities, board games, car brands, holidays, social media platforms, and more.",
  },
};

const defaultTips = [
  "Start with the default bracket size for the cleanest result.",
  "Choose the option you would pick today, not the one you think should win on paper.",
  "Replay with a smaller or larger field if your final ranking feels too easy.",
];

export function bracketKey(category: string, slug: string) {
  return `${category}/${slug}`;
}

export function getBracketTitle(meta: BracketMeta) {
  return (
    bracketOverrides[bracketKey(meta.category, meta.slug)]?.title ??
    `${meta.name} Ranking Bracket - Build Your Top ${Math.min(
      meta.defaultSize,
      meta.itemCount,
    )}`
  );
}

export function getBracketDescription(
  meta: BracketMeta,
  category?: BracketCategory,
) {
  return (
    bracketOverrides[bracketKey(meta.category, meta.slug)]?.description ??
    `Rank ${meta.name.toLowerCase()} in a ${meta.defaultSize}-item ${category?.name.toLowerCase() ?? "ranking"} bracket. Pick winners head-to-head, get your final top list, and share the result.`
  );
}

export function getBracketSeo(
  meta: BracketMeta,
  category: BracketCategory | undefined,
  items: BracketItem[],
): BracketSeo {
  const override = bracketOverrides[bracketKey(meta.category, meta.slug)];
  const itemNames = items.slice(0, 7).map((item) => item.name);
  const itemSummary =
    itemNames.length > 0
      ? `This bracket includes ${itemNames.join(", ")}${
          items.length > itemNames.length ? `, and ${items.length - itemNames.length} more` : ""
        }.`
      : `This bracket includes ${meta.itemCount} options from the ${category?.name.toLowerCase() ?? "ranking"} category.`;

  return {
    primaryKeyword:
      override?.primaryKeyword ?? `${meta.name.toLowerCase()} ranking`,
    title: getBracketTitle(meta),
    description: getBracketDescription(meta, category),
    heading: override?.heading ?? `Make your ${meta.name} ranking`,
    intro:
      override?.intro ??
      `Use this ${meta.name.toLowerCase()} bracket to build a ranked list through quick head-to-head choices. It is useful when you know your favorites but want the final order to come from actual matchups.`,
    itemSummary,
    tips: override?.tips ?? defaultTips,
    faqs:
      override?.faqs ??
      [
        {
          question: `How does the ${meta.name} bracket work?`,
          answer:
            "Pick the winner in each head-to-head matchup. The winners keep advancing until the bracket produces a champion and a final ranking.",
        },
        {
          question: "Can I share my final ranking?",
          answer:
            "Yes. After you finish the bracket, BracketRanker saves a result page that you can share with friends.",
        },
        {
          question: "Can I make my own version?",
          answer:
            "Yes. Use the free bracket maker to add your own items and create a custom ranking bracket.",
        },
      ],
  };
}

export function getRelatedBrackets(meta: BracketMeta, limit = 6) {
  const override = bracketOverrides[bracketKey(meta.category, meta.slug)];
  const wanted = override?.related ?? [];
  const picked = new Map<string, BracketMeta>();

  for (const key of wanted) {
    const related = brackets.find((item) => bracketKey(item.category, item.slug) === key);
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

export function getCategorySeo(category: BracketCategory, count: number) {
  const seo = categoryKeywords[category.slug];
  return {
    title: seo?.title ?? `Rank ${category.name} - Interactive Bracket Rankings`,
    description:
      seo?.description ??
      `Rank the best ${category.name.toLowerCase()} with ${count} interactive bracket games. Pick winners head-to-head, get a top list, and share it.`,
    heading: seo?.heading ?? `${category.name} ranking brackets`,
    intro:
      seo?.intro ??
      `Choose from ${count} ${category.name.toLowerCase()} brackets and build a final ranking through head-to-head matchups.`,
  };
}

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
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.url),
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
) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${meta.name} Bracket`,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    url: absoluteUrl(path),
    description: seo.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function buildSiteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Bracket Ranker",
      alternateName: SITE_NAME,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Web",
      description:
        "Free bracket maker and ranking generator for movies, music, food, sports, TV, games, and custom lists.",
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
        "Create bracket-style rankings, tier list alternatives, and shareable top lists.",
    },
  ];
}
