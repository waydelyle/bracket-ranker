# Bracket Ranker - Site Specification

## Overview

**Domain:** bracketranker.com (or rankbracket.com, mybracketrank.com)
**Niche:** Interactive Bracket-Style Ranking Tool
**Primary Keywords:** "rank my top 10" / "bracket ranking" / "tier list maker"
**Combined Search Volume:** 200K+ monthly searches
**Keyword Difficulty:** KD 5-15 (Easy-Medium)
**Traffic Potential:** 500K-1.5M monthly visits
**Monetization:** Display ads (high pageviews/session), affiliate links, premium features

---

## Concept

Users pick a category (movies, albums, songs, foods, cities, etc.), then go through an interactive bracket-style elimination tournament to rank their favorites. At the end, they get a shareable results image showing their final ranking. The key viral mechanic: people share results and argue about each other's rankings.

---

## Keyword Research

### Primary Keywords

| Keyword | Volume | KD | Priority |
|---------|--------|-----|----------|
| tier list maker | 74,000 | 12 | 🔴 HIGH |
| rank my top 10 | 18,000 | 5 | 🔴 HIGH |
| bracket maker | 33,000 | 15 | 🔴 HIGH |
| ranking generator | 12,000 | 8 | 🔴 HIGH |
| tier list | 110,000 | 20 | 🔴 HIGH |
| song bracket | 8,100 | 3 | 🟡 MED |
| movie ranking | 6,500 | 7 | 🟡 MED |
| album ranking bracket | 4,200 | 2 | 🟡 MED |
| food tier list | 5,800 | 4 | 🟡 MED |
| best movies bracket | 3,400 | 3 | 🟡 MED |

### Long-Tail Variations

| Keyword | Volume | Priority |
|---------|--------|----------|
| rank taylor swift songs | 14,500 | 🔴 HIGH |
| rank marvel movies | 9,800 | 🔴 HIGH |
| rank disney movies | 7,200 | 🔴 HIGH |
| rank fast food restaurants | 5,100 | 🟡 MED |
| rank pizza toppings | 3,200 | 🟡 MED |
| rank dog breeds | 4,500 | 🟡 MED |
| rank nba players | 6,700 | 🟡 MED |
| rank anime characters | 8,200 | 🟡 MED |
| rank video games | 5,600 | 🟡 MED |
| rank sitcoms | 3,800 | 🟡 MED |

### Trending/Seasonal Opportunities

- Award season: "rank Oscar nominees 2026"
- Album drops: "rank [artist] songs" spikes with new releases
- Sports seasons: "rank NFL teams" / "rank NBA players"
- Holidays: "rank Christmas movies" / "rank Halloween candy"

---

## Site Architecture

### URL Structure

```
bracketranker.com/
│
├── /                                    # Homepage - Browse categories
│
├── /create/                             # Create custom bracket
│
├── /movies/                             # Movies hub
│   ├── /movies/marvel/                  # Rank Marvel movies
│   ├── /movies/disney/                  # Rank Disney movies
│   ├── /movies/pixar/                   # Rank Pixar movies
│   ├── /movies/horror/                  # Rank horror movies
│   ├── /movies/christmas/               # Rank Christmas movies
│   ├── /movies/90s/                     # Rank 90s movies
│   ├── /movies/oscar-best-picture/      # Rank Oscar winners
│   └── /movies/custom/                  # Custom movie bracket
│
├── /music/                              # Music hub
│   ├── /music/taylor-swift/             # Rank Taylor Swift songs
│   ├── /music/drake/                    # Rank Drake songs
│   ├── /music/kanye/                    # Rank Kanye albums
│   ├── /music/beatles/                  # Rank Beatles songs
│   ├── /music/2020s-hits/               # Rank 2020s hits
│   └── /music/custom/                   # Custom music bracket
│
├── /tv/                                 # TV shows hub
│   ├── /tv/sitcoms/                     # Rank sitcoms
│   ├── /tv/netflix/                     # Rank Netflix originals
│   ├── /tv/anime/                       # Rank anime
│   └── /tv/reality/                     # Rank reality shows
│
├── /food/                               # Food hub
│   ├── /food/fast-food/                 # Rank fast food chains
│   ├── /food/pizza-toppings/            # Rank pizza toppings
│   ├── /food/snacks/                    # Rank snacks
│   ├── /food/candy/                     # Rank candy
│   ├── /food/cereal/                    # Rank cereals
│   └── /food/ice-cream/                 # Rank ice cream flavors
│
├── /sports/                             # Sports hub
│   ├── /sports/nba-players/             # Rank NBA players
│   ├── /sports/nfl-teams/               # Rank NFL teams
│   ├── /sports/soccer-players/          # Rank soccer players
│   └── /sports/athletes-goat/           # GOAT bracket
│
├── /random/                             # Fun/random hub
│   ├── /random/dog-breeds/              # Rank dog breeds
│   ├── /random/cities/                  # Rank cities to live in
│   ├── /random/superpowers/             # Rank superpowers
│   ├── /random/decades/                 # Rank decades
│   └── /random/emoji/                   # Rank emoji
│
├── /results/[id]/                       # Shareable result page
├── /leaderboard/                        # Global rankings by category
└── /blog/                               # SEO content
```

### Page Count Estimate

| Section | Pages | Notes |
|---------|-------|-------|
| Movies | 20+ | Hub + sub-categories |
| Music | 25+ | Artists + genre brackets |
| TV | 15+ | Hub + categories |
| Food | 20+ | Hub + food types |
| Sports | 15+ | Hub + sport/league |
| Random/Fun | 15+ | Misc popular brackets |
| Results | Dynamic | Generated per user |
| Blog | 20+ | SEO articles |
| **Total** | **130+ static pages** | Expandable |

---

## Core User Flow

```
1. User lands on homepage or category page
2. Picks a bracket (e.g., "Rank Marvel Movies")
3. Sees two items side by side → picks their favorite
4. Elimination rounds continue (32 → 16 → 8 → 4 → 2 → 1)
5. Final ranking generated (Top 10 list + champion)
6. Shareable results image auto-generated
7. User shares on social media / sends to friends
8. Friends click link → see result → want to do their own → LOOP
```

---

## Technical Implementation

### Stack

```
Framework: Next.js 15 (App Router)
UI Components: shadcn/ui
Styling: Tailwind CSS
Image Generation: @vercel/og (for shareable result cards)
Database: Vercel KV (Redis) for vote aggregation + leaderboards
Storage: Vercel Blob for generated result images
Hosting: Vercel (free tier to start)
Analytics: Google Analytics 4 + Vercel Analytics
```

### Key Technical Features

**1. Bracket Engine**
- Randomized seeding each session (so results feel unique)
- Supports 8, 16, 32, or 64 item brackets
- Smooth animations between matchups (Framer Motion)
- Progress bar showing rounds remaining
- Undo last pick button

**2. Shareable Results Card**
- Auto-generated OG image using @vercel/og
- Shows final top 10 ranking with images
- Category branding + site watermark
- Optimized for Twitter/Instagram dimensions
- Unique URL per result: `/results/[nanoid]`

**3. Aggregate Leaderboard**
- Track every matchup globally (Item A vs Item B → winner)
- Display "Community Rankings" per category
- "X% of people agree with your #1 pick"
- Power ranking algorithm (Elo-style or win percentage)

**4. Custom Bracket Creator**
- Users input their own items (text + optional image URL)
- Generates a unique shareable bracket link
- Other users can take the same bracket
- No login required

### Data Structure

```typescript
interface BracketCategory {
  id: string;
  slug: string;
  name: string;           // "Marvel Movies"
  parentCategory: string;  // "movies"
  description: string;
  items: BracketItem[];
  totalPlays: number;
  featured: boolean;
}

interface BracketItem {
  id: string;
  name: string;
  image?: string;         // URL to item image
  subtitle?: string;      // e.g., "2019" for a movie
  metadata?: Record<string, string>;
}

interface BracketResult {
  id: string;             // nanoid
  categoryId: string;
  ranking: string[];      // Ordered item IDs (1st to last)
  champion: string;       // Item ID of winner
  createdAt: Date;
  matchups: Matchup[];    // Full history for replay
}

interface Matchup {
  round: number;
  itemA: string;
  itemB: string;
  winner: string;
}

interface GlobalStats {
  categoryId: string;
  itemId: string;
  wins: number;
  losses: number;
  eloRating: number;
  championCount: number;  // Times picked as #1
}
```

### Component Architecture

```
/src/
├── app/
│   ├── page.tsx                        # Homepage
│   ├── create/page.tsx                 # Custom bracket creator
│   ├── results/[id]/page.tsx           # Shareable result
│   ├── results/[id]/og/route.tsx       # OG image generator
│   ├── leaderboard/page.tsx            # Global rankings
│   ├── [category]/page.tsx             # Category hub
│   ├── [category]/[bracket]/page.tsx   # Bracket play page
│   └── blog/[slug]/page.tsx            # Blog posts
├── components/
│   ├── bracket/
│   │   ├── BracketGame.tsx             # Main game controller
│   │   ├── MatchupCard.tsx             # Two items side by side
│   │   ├── ItemCard.tsx                # Individual item display
│   │   ├── ProgressBar.tsx             # Round progress
│   │   ├── BracketVisualization.tsx    # Tournament tree view
│   │   └── UndoButton.tsx             # Undo last pick
│   ├── results/
│   │   ├── ResultsDisplay.tsx          # Final ranking view
│   │   ├── ShareCard.tsx               # Shareable image preview
│   │   ├── ShareButtons.tsx            # Social share buttons
│   │   └── CompareStats.tsx            # "X% agree with you"
│   ├── leaderboard/
│   │   ├── PowerRankings.tsx           # Elo-based rankings
│   │   ├── WinRateChart.tsx            # Item win percentages
│   │   └── HeadToHead.tsx              # Item vs item stats
│   ├── create/
│   │   ├── BracketBuilder.tsx          # Custom bracket form
│   │   └── ItemInput.tsx               # Add items UI
│   └── ui/
│       └── (shadcn components)
├── lib/
│   ├── bracket-engine.ts               # Core bracket logic
│   ├── elo.ts                          # Elo rating calculations
│   └── og-template.tsx                 # OG image template
└── data/
    ├── movies/
    │   ├── marvel.json
    │   ├── disney.json
    │   └── ...
    ├── music/
    │   ├── taylor-swift.json
    │   └── ...
    └── ...
```

---

## SEO Strategy

### Title Tag Templates

```
Homepage:
Bracket Ranker - Rank Your Favorites in Any Category | BracketRanker

Category Hub:
Rank [Category] - Interactive Bracket Rankings | BracketRanker

Bracket Page:
Rank [Items] - [Count]-Item Bracket Challenge | BracketRanker

Results:
My [Category] Ranking - See My Top 10 | BracketRanker

Examples:
- Rank Marvel Movies - 32-Item Bracket Challenge | BracketRanker
- Rank Taylor Swift Songs - 64-Item Bracket Challenge | BracketRanker
- Rank Fast Food Restaurants - 16-Item Bracket Challenge | BracketRanker
```

### Meta Description Templates

```
Homepage:
Rank anything with interactive brackets! Movies, music, food, sports & more.
Play elimination-style matchups, get your final ranking, and share with friends.

Category Hub:
Rank the best [category] using our bracket system. Pick your favorites
head-to-head, get your top 10, and see how you compare to everyone else.

Bracket Page:
Can you rank all [count] [items]? Play our bracket-style elimination game,
discover your #1 pick, and share your controversial ranking with friends.
```

### Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Bracket Ranker",
  "applicationCategory": "Entertainment",
  "description": "Interactive bracket-style ranking tool",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

### Internal Linking Strategy

- Every results page links back to its bracket ("Try it yourself")
- Category hubs link to all brackets + related categories
- "You might also like" section on every bracket page
- Blog posts link to relevant brackets
- Leaderboard pages link to brackets

---

## Viral Mechanics

### Built-In Sharing Loops

1. **Results Image** - Auto-generated, optimized for Twitter/IG stories
2. **"My #1 is ___"** - Pre-written tweet/caption with result link
3. **Disagreement Bait** - "Only 12% of people agree with your #1 pick"
4. **Challenge Friends** - "Send this bracket to a friend and compare"
5. **Embed Widget** - Allow blogs/forums to embed brackets

### Social Media Strategy

- **TikTok:** Screen-record bracket placements with reactions
- **X/Twitter:** Share result cards, "hot take" format
- **Instagram Stories:** Bracket results as poll-style stories
- **Reddit:** Post brackets to relevant subreddits (r/movies, r/music, etc.)

---

## Monetization Strategy

### Display Ads

- **Placement:** Between rounds (interstitial-style), sidebar, results page
- **Key Advantage:** 15-30+ pageviews per session (each matchup = engagement)
- **Networks:** Mediavine / AdThrive (entertainment content)
- **Estimated RPM:** $12-25 (high engagement, multiple pageviews)
- **Revenue at 500K sessions:** $6,000-12,500/month

### Affiliate Opportunities

| Product | Link Placement | Program | Commission |
|---------|---------------|---------|------------|
| Movies/shows → streaming links | Results page | StreamingObserver | Varies |
| Albums/songs → Spotify/Apple Music | Results page | Apple Affiliate | 7% |
| Food items → DoorDash/Uber Eats | Results page | DoorDash | $5-10/order |
| Games/merch → Amazon | Category pages | Amazon | 4% |
| Sports gear → Fanatics | Sports brackets | Fanatics | 7% |

### Premium Features (Future)

| Feature | Price | Description |
|---------|-------|-------------|
| Custom Branded Brackets | $4.99/mo | Remove watermark, custom colors |
| Bracket Analytics | $2.99/mo | Detailed stats on your brackets |
| Embed Pro | $9.99/mo | Embed brackets on your site |
| API Access | $19.99/mo | Integrate rankings into apps |

---

## Content Strategy

### Pre-Built Bracket Database

| Category | Brackets | Items per Bracket |
|----------|----------|-------------------|
| Movies | 20 | 16-64 |
| Music | 25 | 16-64 |
| TV Shows | 15 | 16-32 |
| Food & Drink | 20 | 16-32 |
| Sports | 15 | 16-64 |
| Random/Fun | 15 | 8-32 |
| **Total** | **110+ brackets** | |

### Blog Content Calendar

**Month 1:**
- "The Most Controversial Marvel Movie Rankings"
- "How to Settle Any Debate with a Bracket"
- "Top 10 Taylor Swift Songs According to 10,000 Fans"

**Month 2:**
- "The Definitive Fast Food Tier List"
- "Every Pixar Movie Ranked by Our Users"
- "Best Christmas Movies: The Community Has Spoken"

**Month 3:**
- "NBA GOAT Bracket: Who Does the Internet Pick?"
- "Dog Breeds Ranked: The Results May Surprise You"
- "Create Your Own Bracket: A Complete Guide"

---

## Development Timeline

### Phase 1: MVP (Week 1-2)
- [ ] Next.js project setup with shadcn/ui
- [ ] Bracket engine core logic
- [ ] Matchup UI component with animations
- [ ] Results display and ranking
- [ ] 10 initial brackets (highest-search-volume categories)
- [ ] Basic OG image generation

### Phase 2: Sharing & Social (Week 3-4)
- [ ] Shareable result URLs with unique IDs
- [ ] OG image generation per result
- [ ] Social share buttons (Twitter, IG, copy link)
- [ ] "Challenge a friend" flow
- [ ] Homepage with category browsing

### Phase 3: Community Features (Week 5-6)
- [ ] Global vote aggregation (Vercel KV)
- [ ] Leaderboard / power rankings per category
- [ ] "X% agree with you" stat on results
- [ ] Custom bracket creator
- [ ] 50 more pre-built brackets

### Phase 4: SEO & Monetization (Week 7-8)
- [ ] Category hub pages with SEO content
- [ ] Blog setup with initial posts
- [ ] Schema markup implementation
- [ ] Analytics setup
- [ ] Ad placements
- [ ] Affiliate link integration

---

## Traffic Projections

| Timeline | Monthly Traffic | Revenue Est. |
|----------|-----------------|--------------|
| Month 1 | 20K-50K | $200-600 |
| Month 3 | 100K-250K | $1,200-4,000 |
| Month 6 | 300K-700K | $3,600-12,000 |
| Month 12 | 700K-1.5M | $8,000-25,000 |

---

## Risk Assessment

### Risks

1. **Image licensing** - Need rights for movie posters, album art, etc.
2. **Data maintenance** - New movies/songs/players need to be added
3. **Copycat risk** - Concept is easy to replicate
4. **Ad blockers** - Entertainment audience skews tech-savvy

### Mitigations

1. Use free APIs (TMDB for movies, Spotify for music) or user-uploaded images
2. Build admin tools for easy data updates; allow user-submitted brackets
3. Move fast, build community + brand; custom bracket creator creates moat
4. Diversify revenue with affiliate + premium features

---

## Launch Strategy

### Pre-Launch
- [ ] Domain configured
- [ ] Vercel project deployed
- [ ] 10+ high-value brackets ready
- [ ] OG images tested across platforms
- [ ] Social media accounts created

### Launch Day
- [ ] Post to Reddit: r/InternetIsBeautiful, r/webdev, r/SideProject
- [ ] Post to Hacker News (Show HN)
- [ ] Tweet from project account + personal accounts
- [ ] TikTok demo video of bracket gameplay
- [ ] Submit to Product Hunt

### Post-Launch (Week 1-2)
- [ ] Monitor analytics for top-performing brackets
- [ ] Create more brackets in high-demand categories
- [ ] Engage with social shares / quote tweets
- [ ] Submit sitemap to Google Search Console
- [ ] Respond to user feedback and requests

---

*Research conducted: March 28, 2026*
