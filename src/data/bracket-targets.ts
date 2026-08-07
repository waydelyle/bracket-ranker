/**
 * Per-bracket search targeting.
 *
 * Every bracket page gets a hand-written primary keyword, title and meta
 * description. This deliberately replaces the old single title/description
 * formula, which produced 100 near-identical pages ("<Name> Ranking Bracket -
 * Build Your Top 32" / "Rank <name> in a N-item <category> bracket...").
 *
 * Keyword choices come from Google Keyword Planner volume (US, 2026-07):
 * "tier list" phrasing massively outsells "bracket" phrasing for consumer
 * ranking topics (tier list 165k, tier list maker 90.5k, fast food tier list
 * 9.9k, anime tier list 4.4k), while "bracket maker" (40.5k) is dominated by
 * tournament-scheduling intent that this site does not serve. Music and
 * character topics are strongest as "sorter" (taylor swift song sorter 1.3k
 * vs rank taylor swift songs 480).
 *
 * Titles are kept short because the layout appends " | BracketRanker" (16
 * chars) and Google truncates around 60.
 */
export interface BracketTarget {
  /** Primary keyword the page is written for. */
  keyword: string;
  /** <title> before the site-name suffix. Keep to ~45 characters. */
  title: string;
  /** Meta description. Keep to 120-158 characters. */
  description: string;
  /** Secondary phrasings worked into on-page copy. */
  variants?: string[];
  /** Hand-picked related brackets (category-mates fill any remainder). */
  related?: string[];
}

export const bracketTargets: Record<string, BracketTarget> = {
  // ==========================================================
  // MOVIES
  // ==========================================================
  "movies/marvel": {
    keyword: "rank Marvel movies",
    title: "Rank Marvel Movies: MCU Tier List",
    description:
      "Rank every MCU film head-to-head, from Iron Man and The Avengers to Endgame and the multiverse era. One matchup at a time, no dragging.",
    variants: ["MCU tier list", "Marvel movie ranking", "Marvel movie sorter"],
    related: [
      "movies/superhero",
      "random/marvel-characters",
      "movies/franchise",
      "movies/action",
      "movies/scifi",
    ],
  },
  "movies/disney": {
    keyword: "Disney movie tier list",
    title: "Disney Movie Tier List Maker",
    description:
      "Build a Disney animated tier list by picking winners: The Lion King vs Aladdin, Frozen vs Moana, Beauty and the Beast vs The Little Mermaid.",
    variants: ["rank Disney movies", "Disney movie sorter"],
    related: [
      "movies/pixar",
      "random/disney-characters",
      "movies/animated",
      "movies/studio-ghibli",
    ],
  },
  "movies/pixar": {
    keyword: "rank Pixar movies",
    title: "Rank Pixar Movies: Pixar Tier List",
    description:
      "Settle the Pixar debate for good. Toy Story vs Up, WALL-E vs Inside Out, Coco vs Ratatouille - pick a winner each round and crown a champion.",
    variants: ["Pixar tier list", "Pixar movie sorter"],
    related: [
      "movies/disney",
      "movies/animated",
      "movies/studio-ghibli",
      "random/disney-characters",
    ],
  },
  "movies/horror": {
    keyword: "horror movie tier list",
    title: "Horror Movie Tier List Maker",
    description:
      "Rank the scariest films ever made in a head-to-head horror tier list. The Shining, The Exorcist, Get Out, Hereditary, Halloween and more.",
    variants: ["rank horror movies", "scary movie tier list"],
  },
  "movies/christmas": {
    keyword: "rank Christmas movies",
    title: "Christmas Movie Tier List",
    description:
      "Home Alone or Elf? Is Die Hard a Christmas movie? Rank the holiday canon one matchup at a time and settle the argument before December.",
    variants: ["Christmas movie tier list", "holiday movie ranking"],
  },
  "movies/90s": {
    keyword: "best 90s movies ranked",
    title: "90s Movie Tier List",
    description:
      "Titanic, The Matrix, Pulp Fiction, Fight Club, Jurassic Park. Rank the decade that shaped modern film by picking a winner in every matchup.",
    variants: ["rank 90s movies", "90s film tier list"],
  },
  "movies/oscar-best-picture": {
    keyword: "rank Best Picture winners",
    title: "Best Picture Winners Ranked",
    description:
      "Rank Academy Award Best Picture winners head-to-head, from Parasite and Oppenheimer back through the classics, and see which one really holds up.",
    variants: ["Oscar Best Picture tier list", "rank Oscar winners"],
  },
  "movies/action": {
    keyword: "action movie tier list",
    title: "Action Movie Tier List Maker",
    description:
      "Mad Max vs John Wick. Die Hard vs The Dark Knight. Build an action movie tier list from direct matchups instead of arguing over one long list.",
    variants: ["rank action movies", "action movie sorter"],
  },
  "movies/comedy": {
    keyword: "rank comedy movies",
    title: "Comedy Movie Tier List",
    description:
      "Superbad, Anchorman, Bridesmaids, The Hangover, Step Brothers. Pick the funnier film in every matchup and build your comedy tier list.",
    variants: ["comedy movie tier list", "funniest movies ranked"],
  },
  "movies/animated": {
    keyword: "animated movie tier list",
    title: "Animated Movie Tier List Maker",
    description:
      "Rank animated films across studios and decades: Spirited Away, The Lion King, Toy Story, Shrek, Spider-Verse and more, one matchup at a time.",
    variants: ["rank animated movies", "cartoon movie tier list"],
  },
  "movies/scifi": {
    keyword: "rank sci-fi movies",
    title: "Sci-Fi Movie Tier List",
    description:
      "Blade Runner or Alien? Interstellar or 2001? Rank science fiction cinema through head-to-head picks and get a ranking you can actually defend.",
    variants: ["sci-fi movie tier list", "science fiction movie ranking"],
  },
  "movies/romcom": {
    keyword: "rank rom coms",
    title: "Rom-Com Tier List: Rank the Best",
    description:
      "When Harry Met Sally, 10 Things I Hate About You, Notting Hill, The Notebook. Rank romantic comedies by choosing a favourite in every round.",
    variants: ["romantic comedy tier list", "rom com ranking"],
  },
  "movies/thriller": {
    keyword: "thriller movie tier list",
    title: "Thriller Movie Tier List Maker",
    description:
      "Se7en, Silence of the Lambs, Gone Girl, Zodiac, Prisoners. Rank the best psychological thrillers by picking a winner in each head-to-head.",
    variants: ["rank thriller movies", "psychological thriller ranking"],
  },
  "movies/2000s": {
    keyword: "best 2000s movies ranked",
    title: "2000s Movie Tier List",
    description:
      "The Dark Knight, Lord of the Rings, Gladiator, No Country for Old Men. Rank the 2000s film canon one matchup at a time and share the result.",
    variants: ["rank 2000s movies", "2000s film tier list"],
  },
  "movies/2010s": {
    keyword: "best 2010s movies ranked",
    title: "2010s Movie Tier List",
    description:
      "Inception, Mad Max: Fury Road, Parasite, Whiplash, Get Out. Rank the decade's best films through direct matchups and build your final order.",
    variants: ["rank 2010s movies", "2010s film tier list"],
  },
  "movies/2020s": {
    keyword: "best 2020s movies ranked",
    title: "2020s Movie Tier List",
    description:
      "Everything Everywhere All at Once, Oppenheimer, Dune, Top Gun: Maverick. Rank the modern era's biggest films with head-to-head picks.",
    variants: ["rank 2020s movies", "recent movie tier list"],
  },
  "movies/franchise": {
    keyword: "rank movie franchises",
    title: "Movie Franchise Tier List",
    description:
      "Star Wars vs Marvel. Harry Potter vs Lord of the Rings. Rank the biggest film franchises against each other and see which universe wins.",
    variants: ["movie franchise tier list", "best film series ranked"],
  },
  "movies/studio-ghibli": {
    keyword: "Ghibli movie tier list",
    title: "Studio Ghibli Tier List",
    description:
      "Rank every Studio Ghibli film head-to-head: Spirited Away, Princess Mononoke, Totoro, Howl's Moving Castle, Grave of the Fireflies and more.",
    variants: ["rank Ghibli movies", "Studio Ghibli sorter"],
    related: ["tv/anime", "movies/animated", "movies/pixar", "movies/disney"],
  },
  "movies/superhero": {
    keyword: "rank superhero movies",
    title: "Superhero Movie Tier List",
    description:
      "The Dark Knight, Endgame, Into the Spider-Verse, Logan, Black Panther. Rank superhero films across DC, Marvel and beyond in one bracket.",
    variants: ["superhero movie tier list", "comic book movie ranking"],
    related: ["movies/marvel", "random/marvel-characters", "movies/action"],
  },
  "movies/war": {
    keyword: "rank war movies",
    title: "War Movie Tier List",
    description:
      "Saving Private Ryan, Apocalypse Now, Dunkirk, Schindler's List, 1917. Rank the greatest war films with one head-to-head choice per round.",
    variants: ["war movie tier list", "best war films ranked"],
  },

  // ==========================================================
  // MUSIC
  // ==========================================================
  "music/taylor-swift": {
    keyword: "Taylor Swift song sorter",
    title: "Taylor Swift Song Sorter",
    description:
      "Sort 64 Taylor Swift songs into your personal ranking. All Too Well vs Cruel Summer, Love Story vs Anti-Hero - every era, one matchup at a time.",
    variants: [
      "rank Taylor Swift songs",
      "Taylor Swift tier list",
      "Taylor Swift album sorter",
    ],
    related: [
      "music/pop-hits-2010s",
      "music/breakup-songs",
      "music/love-songs",
      "music/2020s-hits",
    ],
  },
  "music/drake": {
    keyword: "Drake song sorter",
    title: "Drake Song Sorter: Rank the Hits",
    description:
      "Rank Drake's catalogue head-to-head. God's Plan vs One Dance, Hotline Bling vs Passionfruit, Take Care vs Nice For What - pick and move on.",
    variants: ["rank Drake songs", "Drake tier list"],
  },
  "music/kanye": {
    keyword: "Kanye song sorter",
    title: "Kanye West Song Sorter",
    description:
      "Sort Kanye West's songs and albums into a personal ranking: Runaway, Stronger, Jesus Walks, POWER, Gold Digger and more, matchup by matchup.",
    variants: ["rank Kanye songs", "Kanye tier list"],
  },
  "music/beatles": {
    keyword: "Beatles song sorter",
    title: "Beatles Song Sorter",
    description:
      "Hey Jude or Let It Be? Come Together or Yesterday? Sort the Beatles catalogue into your own ranking with one head-to-head pick per round.",
    variants: ["rank Beatles songs", "Beatles tier list"],
  },
  "music/2020s-hits": {
    keyword: "rank 2020s songs",
    title: "2020s Hits Song Sorter",
    description:
      "Blinding Lights, As It Was, drivers license, Levitating, Flowers. Sort the decade's biggest hits into your personal top order.",
    variants: ["2020s music tier list", "modern pop song sorter"],
  },
  "music/rap-albums": {
    keyword: "rank rap albums",
    title: "Rap Album Tier List",
    description:
      "Illmatic vs Ready to Die. MBDTF vs To Pimp a Butterfly. Rank the greatest hip-hop albums ever made through direct head-to-head matchups.",
    variants: ["hip hop album tier list", "best rap albums ranked"],
    related: ["music/hip-hop-artists", "music/debut-albums", "music/rnb-songs"],
  },
  "music/rock-songs": {
    keyword: "rank classic rock songs",
    title: "Classic Rock Song Sorter",
    description:
      "Stairway to Heaven vs Bohemian Rhapsody. Hotel California vs Sweet Child O' Mine. Sort classic rock's greatest tracks into your own order.",
    variants: ["classic rock tier list", "rock song sorter"],
  },
  "music/pop-hits-2010s": {
    keyword: "rank 2010s pop songs",
    title: "2010s Pop Song Sorter",
    description:
      "Uptown Funk, Shape of You, Happy, Rolling in the Deep, Despacito. Sort the 2010s pop era into a ranking built from head-to-head picks.",
    variants: ["2010s music tier list", "2010s song sorter"],
  },
  "music/rnb-songs": {
    keyword: "rank R&B songs",
    title: "R&B Song Sorter",
    description:
      "No Diggity, Waterfalls, Killing Me Softly, Ain't No Sunshine. Sort the greatest R&B tracks into your personal ranking, one matchup at a time.",
    variants: ["R&B tier list", "best R&B songs ranked"],
  },
  "music/edm-songs": {
    keyword: "rank EDM songs",
    title: "EDM Song Sorter",
    description:
      "Levels vs Strobe. Titanium vs Wake Me Up. Sort the biggest dance and electronic tracks into a ranking decided entirely by your own picks.",
    variants: ["EDM tier list", "dance music sorter"],
  },
  "music/country-songs": {
    keyword: "rank country songs",
    title: "Country Song Sorter",
    description:
      "Jolene, Friends in Low Places, Ring of Fire, Country Roads. Sort country music's defining songs into your own ranked list.",
    variants: ["country music tier list", "best country songs ranked"],
  },
  "music/one-hit-wonders": {
    keyword: "rank one hit wonders",
    title: "One-Hit Wonder Song Sorter",
    description:
      "Take On Me, Tainted Love, Mambo No. 5, Come On Eileen. Sort the greatest one-hit wonders ever recorded into a single ranked list.",
    variants: ["one hit wonder tier list", "best one hit wonders ranked"],
  },
  "music/boy-bands": {
    keyword: "rank boy bands",
    title: "Boy Band Tier List",
    description:
      "BTS vs One Direction. *NSYNC vs Backstreet Boys. Rank the biggest boy bands of all time by choosing a winner in every head-to-head.",
    variants: ["boy band ranking", "best boy bands ranked"],
    related: ["music/girl-groups", "music/pop-hits-2010s", "music/90s-hits"],
  },
  "music/girl-groups": {
    keyword: "rank girl groups",
    title: "Girl Group Tier List",
    description:
      "Destiny's Child, Spice Girls, TLC, The Supremes, BLACKPINK. Rank the greatest girl groups ever with one head-to-head pick per round.",
    variants: ["girl group ranking", "best girl groups ranked"],
    related: ["music/boy-bands", "music/rnb-songs", "music/90s-hits"],
  },
  "music/musical-artists": {
    keyword: "rank musical artists",
    title: "Greatest Artists Tier List",
    description:
      "The Beatles vs Michael Jackson. Queen vs Bowie. Prince vs Beyonce. Rank the greatest musical artists of all time in one head-to-head bracket.",
    variants: ["greatest artists ranked", "musician tier list"],
  },
  "music/album-covers": {
    keyword: "rank album covers",
    title: "Album Cover Tier List",
    description:
      "Dark Side of the Moon, Abbey Road, Nevermind, Sgt. Pepper's. Rank the most iconic album artwork ever printed, matchup by matchup.",
    variants: ["album art tier list", "best album covers ranked"],
  },
  "music/love-songs": {
    keyword: "rank love songs",
    title: "Love Song Sorter",
    description:
      "I Will Always Love You, At Last, Can't Help Falling in Love, Thinking Out Loud. Sort the greatest love songs into your own ranked order.",
    variants: ["love song tier list", "best love songs ranked"],
    related: ["music/breakup-songs", "music/rnb-songs", "music/karaoke-songs"],
  },
  "music/karaoke-songs": {
    keyword: "best karaoke songs ranked",
    title: "Karaoke Song Sorter",
    description:
      "Bohemian Rhapsody, Don't Stop Believin', Sweet Caroline, Mr. Brightside. Sort the greatest karaoke songs into a set list you can share.",
    variants: ["karaoke tier list", "karaoke song ranking"],
  },
  "music/workout-songs": {
    keyword: "best workout songs ranked",
    title: "Workout Song Sorter",
    description:
      "Lose Yourself, Eye of the Tiger, Till I Collapse, POWER. Sort gym anthems into a ranked playlist decided by head-to-head picks.",
    variants: ["gym song tier list", "workout playlist ranking"],
  },
  "music/summer-songs": {
    keyword: "best summer songs ranked",
    title: "Summer Song Sorter",
    description:
      "Cruel Summer, California Gurls, Summer of '69, Hot Girl Summer. Sort the ultimate summer soundtrack into your own ranked order.",
    variants: ["summer song tier list", "summer playlist ranking"],
  },
  "music/breakup-songs": {
    keyword: "best breakup songs ranked",
    title: "Breakup Song Sorter",
    description:
      "Someone Like You, Cry Me a River, Nothing Compares 2 U, We Are Never Getting Back Together. Sort breakup anthems into a ranked list.",
    variants: ["breakup song tier list", "sad song ranking"],
    related: ["music/love-songs", "music/taylor-swift", "music/rnb-songs"],
  },
  "music/90s-hits": {
    keyword: "rank 90s songs",
    title: "90s Song Sorter: Rank the Hits",
    description:
      "Smells Like Teen Spirit, Wannabe, No Scrubs, ...Baby One More Time. Sort the defining songs of the 1990s into your own ranking.",
    variants: ["90s music tier list", "90s song ranking"],
  },
  "music/hip-hop-artists": {
    keyword: "rank rappers",
    title: "Rapper Tier List: Rank the GOATs",
    description:
      "2Pac vs Biggie. Jay-Z vs Nas. Kendrick vs Eminem. Rank the greatest hip-hop artists of all time through direct head-to-head matchups.",
    variants: ["hip hop artist tier list", "greatest rappers ranked"],
    related: ["music/rap-albums", "music/musical-artists", "music/rnb-songs"],
  },
  "music/guitar-solos": {
    keyword: "best guitar solos ranked",
    title: "Guitar Solo Tier List",
    description:
      "Stairway to Heaven, Comfortably Numb, Free Bird, Eruption. Rank the greatest guitar solos ever recorded, one head-to-head at a time.",
    variants: ["guitar solo ranking", "greatest solos tier list"],
  },
  "music/debut-albums": {
    keyword: "best debut albums ranked",
    title: "Debut Album Tier List",
    description:
      "Illmatic, Ready to Die, The College Dropout, Born to Run. Rank the greatest debut albums in music history with head-to-head picks.",
    variants: ["debut album ranking", "first album tier list"],
  },

  // ==========================================================
  // TV
  // ==========================================================
  "tv/anime": {
    keyword: "anime tier list",
    title: "Anime Tier List Maker",
    description:
      "Build an anime tier list from head-to-head matchups: Attack on Titan, Fullmetal Alchemist, Death Note, One Piece, Demon Slayer and more.",
    variants: ["anime sorter", "rank anime series", "anime ranking"],
    related: [
      "tv/animated-shows",
      "movies/studio-ghibli",
      "tv/drama",
      "random/video-games",
    ],
  },
  "tv/sitcoms": {
    keyword: "sitcom tier list",
    title: "Sitcom Tier List Maker",
    description:
      "Friends vs The Office. Seinfeld vs Parks and Rec. Build a sitcom tier list by picking the funnier show in every head-to-head matchup.",
    variants: ["rank sitcoms", "comedy show tier list"],
  },
  "tv/netflix": {
    keyword: "Netflix show tier list",
    title: "Netflix Show Tier List",
    description:
      "Stranger Things, Squid Game, Bridgerton, Ozark, Wednesday. Rank Netflix originals head-to-head and see which one survives the bracket.",
    variants: ["rank Netflix shows", "Netflix original ranking"],
  },
  "tv/reality": {
    keyword: "reality TV tier list",
    title: "Reality TV Tier List",
    description:
      "Survivor, The Bachelor, RuPaul's Drag Race, Love Island, The Traitors. Rank reality television with one head-to-head pick per round.",
    variants: ["rank reality shows", "reality show ranking"],
  },
  "tv/drama": {
    keyword: "rank TV dramas",
    title: "TV Drama Tier List",
    description:
      "Breaking Bad vs The Wire. The Sopranos vs Succession. Rank prestige television's greatest dramas through direct head-to-head choices.",
    variants: ["TV drama tier list", "best drama series ranked"],
    related: ["tv/crime", "tv/miniseries", "tv/2000s-tv"],
  },
  "tv/animated-shows": {
    keyword: "cartoon tier list",
    title: "Cartoon & Animated Show Tier List",
    description:
      "The Simpsons, Rick and Morty, Avatar: The Last Airbender, Bob's Burgers. Rank animated TV shows by picking a winner in every matchup.",
    variants: ["rank cartoons", "animated show ranking"],
    related: ["tv/anime", "tv/sitcoms", "movies/animated"],
  },
  "tv/crime": {
    keyword: "rank crime shows",
    title: "Crime Show Tier List",
    description:
      "Breaking Bad, The Wire, True Detective, Mindhunter, Better Call Saul. Rank the best crime series with head-to-head matchups.",
    variants: ["crime show tier list", "best crime dramas ranked"],
  },
  "tv/sci-fi-tv": {
    keyword: "rank sci-fi shows",
    title: "Sci-Fi TV Tier List",
    description:
      "Stranger Things, Black Mirror, The Expanse, Westworld, Star Trek. Rank science fiction television one head-to-head choice at a time.",
    variants: ["sci-fi TV tier list", "best sci-fi series ranked"],
  },
  "tv/miniseries": {
    keyword: "rank miniseries",
    title: "Miniseries Tier List",
    description:
      "Chernobyl, Band of Brothers, The Queen's Gambit, Mare of Easttown. Rank limited series head-to-head and find the best short-run show.",
    variants: ["limited series tier list", "best miniseries ranked"],
  },
  "tv/90s-tv": {
    keyword: "rank 90s TV shows",
    title: "90s TV Show Tier List",
    description:
      "Friends, Seinfeld, The X-Files, Buffy, ER. Rank the shows that defined 1990s television with one head-to-head pick per round.",
    variants: ["90s TV tier list", "best 90s shows ranked"],
  },
  "tv/2000s-tv": {
    keyword: "rank 2000s TV shows",
    title: "2000s TV Show Tier List",
    description:
      "The Wire, Lost, The Office, Breaking Bad, Mad Men. Rank the golden age of 2000s television through direct head-to-head matchups.",
    variants: ["2000s TV tier list", "best 2000s shows ranked"],
  },
  "tv/talk-shows": {
    keyword: "rank talk show hosts",
    title: "Talk Show Host Tier List",
    description:
      "Johnny Carson, Letterman, Oprah, Conan, Craig Ferguson. Rank late night and daytime hosts by picking a favourite in every matchup.",
    variants: ["talk show tier list", "best late night hosts ranked"],
  },
  "tv/game-shows": {
    keyword: "rank game shows",
    title: "Game Show Tier List",
    description:
      "Jeopardy!, Wheel of Fortune, The Price Is Right, Millionaire. Rank the greatest game shows ever made with head-to-head matchups.",
    variants: ["game show tier list", "best game shows ranked"],
  },
  "tv/tv-villains": {
    keyword: "rank TV villains",
    title: "TV Villain Tier List",
    description:
      "Walter White, Cersei Lannister, Gus Fring, Joffrey, Negan. Rank television's greatest villains one head-to-head choice at a time.",
    variants: ["TV villain sorter", "best TV villains ranked"],
    related: ["tv/drama", "tv/crime", "random/marvel-characters"],
  },
  "tv/tv-couples": {
    keyword: "rank TV couples",
    title: "TV Couple Tier List",
    description:
      "Jim & Pam, Ross & Rachel, Leslie & Ben, Monica & Chandler. Rank television's best couples by picking a favourite in every matchup.",
    variants: ["TV couple sorter", "best TV couples ranked"],
  },

  // ==========================================================
  // FOOD
  // ==========================================================
  "food/fast-food": {
    keyword: "fast food tier list",
    title: "Fast Food Tier List Maker",
    description:
      "Make a fast food tier list the honest way: McDonald's vs Chick-fil-A, In-N-Out vs Five Guys, Taco Bell vs Wendy's. Pick a winner, move on.",
    variants: [
      "fast food chain tier list",
      "rank fast food restaurants",
      "fast food restaurant tier list",
    ],
    related: [
      "food/fast-food-burgers",
      "food/pizza-chains",
      "food/sandwiches",
      "food/sodas",
    ],
  },
  "food/pizza-toppings": {
    keyword: "pizza toppings tier list",
    title: "Pizza Toppings Tier List",
    description:
      "Pepperoni vs mushrooms. Extra cheese vs sausage. Pineapple vs everything. Build a pizza toppings tier list from head-to-head matchups.",
    variants: ["rank pizza toppings", "pizza topping ranking"],
    related: ["food/pizza-chains", "food/fast-food", "food/condiments"],
  },
  "food/snacks": {
    keyword: "snack tier list",
    title: "Snack Tier List Maker",
    description:
      "Doritos vs Cheez-Its. Oreos vs Goldfish. Rank 32 snack foods head-to-head and settle which one deserves the top of the pantry.",
    variants: ["rank snacks", "snack food ranking"],
  },
  "food/candy": {
    keyword: "candy tier list",
    title: "Candy Tier List Maker",
    description:
      "Reese's vs Snickers. Skittles vs Starburst. Kit Kat vs Twix. Rank 32 candies head-to-head and build the definitive Halloween tier list.",
    variants: ["rank candy", "Halloween candy tier list"],
  },
  "food/cereal": {
    keyword: "cereal tier list",
    title: "Cereal Tier List Maker",
    description:
      "Lucky Charms vs Cinnamon Toast Crunch. Frosted Flakes vs Froot Loops. Rank 32 breakfast cereals through head-to-head matchups.",
    variants: ["rank cereals", "breakfast cereal ranking"],
    related: ["food/breakfast-foods", "food/snacks", "food/cookies"],
  },
  "food/ice-cream": {
    keyword: "ice cream flavor tier list",
    title: "Ice Cream Flavor Tier List",
    description:
      "Cookies & cream vs mint chocolate chip. Cookie dough vs butter pecan. Rank ice cream flavours by picking a favourite in every matchup.",
    variants: ["rank ice cream flavors", "ice cream ranking"],
    related: ["food/desserts", "food/cookies", "food/chocolate"],
  },
  "food/cookies": {
    keyword: "cookie tier list",
    title: "Cookie Tier List",
    description:
      "Chocolate chip vs snickerdoodle. Oatmeal raisin vs peanut butter. Rank every cookie worth baking with one head-to-head pick per round.",
    variants: ["rank cookies", "best cookies ranked"],
  },
  "food/fruits": {
    keyword: "fruit tier list",
    title: "Fruit Tier List Maker",
    description:
      "Strawberry vs mango. Watermelon vs peach. Rank 16 fruits head-to-head and find out which one you actually pick under pressure.",
    variants: ["rank fruits", "best fruit ranking"],
  },
  "food/sodas": {
    keyword: "soda tier list",
    title: "Soda Tier List Maker",
    description:
      "Coke vs Pepsi. Dr Pepper vs Mountain Dew. Sprite vs Fanta. Rank soft drinks head-to-head and settle the fridge argument for good.",
    variants: ["rank sodas", "soft drink tier list"],
    related: ["food/fast-food", "food/coffee-drinks", "food/snacks"],
  },
  "food/fast-food-burgers": {
    keyword: "fast food burger tier list",
    title: "Fast Food Burger Tier List",
    description:
      "Big Mac vs Whopper. Double-Double vs Baconator. Rank fast food burgers head-to-head and find the best drive-thru burger in America.",
    variants: ["rank fast food burgers", "best fast food burger"],
    related: ["food/fast-food", "food/sandwiches", "food/pizza-chains"],
  },
  "food/pizza-chains": {
    keyword: "pizza chain tier list",
    title: "Pizza Chain Tier List",
    description:
      "Domino's vs Pizza Hut vs Papa John's vs Little Caesars. Rank the big pizza chains head-to-head and see which one really wins.",
    variants: ["rank pizza chains", "best pizza chain ranked"],
    related: ["food/pizza-toppings", "food/fast-food", "food/fast-food-burgers"],
  },
  "food/chocolate": {
    keyword: "chocolate tier list",
    title: "Chocolate Brand Tier List",
    description:
      "Reese's vs Lindt. Godiva vs Ghirardelli. Toblerone vs Cadbury. Rank chocolate brands by picking a favourite in every head-to-head.",
    variants: ["rank chocolate brands", "best chocolate ranked"],
  },
  "food/coffee-drinks": {
    keyword: "coffee tier list",
    title: "Coffee Drink Tier List",
    description:
      "Latte vs cappuccino. Cold brew vs iced coffee. Espresso vs flat white. Rank coffee drinks head-to-head and find your real order.",
    variants: ["rank coffee drinks", "coffee ranking"],
  },
  "food/asian-cuisines": {
    keyword: "Asian food tier list",
    title: "Asian Cuisine Tier List",
    description:
      "Japanese vs Thai. Korean vs Chinese. Vietnamese vs Indian. Rank Asian cuisines head-to-head and see which kitchen you really choose.",
    variants: ["rank Asian cuisines", "best Asian food ranked"],
  },
  "food/comfort-foods": {
    keyword: "comfort food tier list",
    title: "Comfort Food Tier List",
    description:
      "Mac & cheese vs grilled cheese. Pizza vs mashed potatoes. Rank comfort foods head-to-head and find the meal you'd actually pick.",
    variants: ["rank comfort foods", "best comfort food ranked"],
  },
  "food/breakfast-foods": {
    keyword: "breakfast food tier list",
    title: "Breakfast Food Tier List",
    description:
      "Pancakes vs waffles. French toast vs bacon. Rank breakfast foods head-to-head and settle the most important argument of the day.",
    variants: ["rank breakfast foods", "best breakfast ranked"],
    related: ["food/cereal", "food/coffee-drinks", "food/comfort-foods"],
  },
  "food/condiments": {
    keyword: "condiment tier list",
    title: "Condiment Tier List",
    description:
      "Ketchup vs mustard. Ranch vs hot sauce. Mayo vs BBQ. Rank condiments head-to-head and find out which bottle actually earns its shelf.",
    variants: ["rank condiments", "best sauces ranked"],
  },
  "food/sandwiches": {
    keyword: "sandwich tier list",
    title: "Sandwich Tier List Maker",
    description:
      "BLT vs Reuben. Philly cheesesteak vs Cuban. Club vs grilled cheese. Rank sandwiches head-to-head and crown the best one there is.",
    variants: ["rank sandwiches", "best sandwich ranked"],
  },
  "food/desserts": {
    keyword: "dessert tier list",
    title: "Dessert Tier List Maker",
    description:
      "Chocolate cake vs cheesecake. Apple pie vs tiramisu. Brownies vs creme brulee. Rank desserts head-to-head and settle the menu.",
    variants: ["rank desserts", "best dessert ranked"],
    related: ["food/ice-cream", "food/cookies", "food/chocolate"],
  },
  "food/street-food": {
    keyword: "street food tier list",
    title: "Street Food Tier List",
    description:
      "Tacos vs gyros. Hot dogs vs empanadas. Falafel vs banh mi. Rank the world's best street food with one head-to-head pick per round.",
    variants: ["rank street food", "best street food ranked"],
  },

  // ==========================================================
  // SPORTS
  // ==========================================================
  "sports/nba-players": {
    keyword: "rank NBA players",
    title: "NBA Player Tier List: GOAT Bracket",
    description:
      "Jordan vs LeBron. Kobe vs Curry. Kareem vs Shaq. Rank the greatest NBA players of all time through 31 head-to-head matchups.",
    variants: ["NBA GOAT bracket", "NBA player tier list"],
    related: [
      "sports/nba-teams",
      "sports/athletes-goat",
      "sports/soccer-players",
    ],
  },
  "sports/nfl-teams": {
    keyword: "rank NFL teams",
    title: "NFL Team Tier List",
    description:
      "Cowboys vs Patriots. Packers vs Chiefs. Rank all 32 NFL franchises head-to-head and build a tier list you can take to the group chat.",
    variants: ["NFL team tier list", "NFL power rankings bracket"],
  },
  "sports/soccer-players": {
    keyword: "rank soccer players",
    title: "Soccer Player Tier List",
    description:
      "Messi vs Ronaldo. Pele vs Maradona. Zidane vs Ronaldinho. Rank football's greatest players through direct head-to-head matchups.",
    variants: ["football player tier list", "soccer GOAT bracket"],
    related: ["sports/soccer-teams", "sports/athletes-goat", "sports/nba-players"],
  },
  "sports/athletes-goat": {
    keyword: "greatest athlete of all time",
    title: "GOAT Athlete Tier List",
    description:
      "Jordan vs Ali. Serena vs Messi. Brady vs Bolt. Settle the greatest-athlete-of-all-time debate with 31 head-to-head matchups.",
    variants: ["GOAT bracket", "rank greatest athletes"],
  },
  "sports/nba-teams": {
    keyword: "rank NBA teams",
    title: "NBA Team Tier List",
    description:
      "Lakers vs Celtics. Warriors vs Bulls. Rank all 30 NBA franchises head-to-head and see which organisation comes out on top.",
    variants: ["NBA team tier list", "NBA franchise ranking"],
  },
  "sports/mlb-teams": {
    keyword: "rank MLB teams",
    title: "MLB Team Tier List",
    description:
      "Yankees vs Dodgers. Red Sox vs Cubs. Rank every MLB franchise head-to-head and build a baseball tier list from your own picks.",
    variants: ["MLB team tier list", "baseball team ranking"],
  },
  "sports/olympic-sports": {
    keyword: "rank Olympic sports",
    title: "Olympic Sport Tier List",
    description:
      "100m sprint vs gymnastics. Swimming vs basketball. Rank Olympic sports head-to-head and find the event you'd actually watch.",
    variants: ["Olympic sport ranking", "best Olympic events ranked"],
  },
  "sports/soccer-teams": {
    keyword: "rank football clubs",
    title: "Football Club Tier List",
    description:
      "Real Madrid vs Barcelona. Man United vs Liverpool. Bayern vs Milan. Rank the world's biggest football clubs head-to-head.",
    variants: ["soccer club tier list", "rank soccer teams"],
    related: ["sports/soccer-players", "sports/stadiums", "sports/nfl-teams"],
  },
  "sports/tennis-players": {
    keyword: "rank tennis players",
    title: "Tennis Player Tier List",
    description:
      "Federer vs Nadal vs Djokovic. Serena vs Graf. Rank tennis's greatest players head-to-head and settle your own GOAT debate.",
    variants: ["tennis GOAT bracket", "tennis player ranking"],
  },
  "sports/combat-sports": {
    keyword: "rank boxers and fighters",
    title: "Fighter Tier List: Boxing & MMA",
    description:
      "Ali vs Tyson. Mayweather vs Pacquiao. Jones vs McGregor. Rank boxing and MMA's greatest fighters through head-to-head matchups.",
    variants: ["boxing tier list", "MMA fighter ranking"],
  },
  "sports/college-teams": {
    keyword: "rank college teams",
    title: "College Sports Tier List",
    description:
      "Alabama vs Ohio State. Michigan vs Georgia. Duke vs UNC. Rank college sports' biggest programs head-to-head in one bracket.",
    variants: ["college football tier list", "college program ranking"],
  },
  "sports/sports-movies": {
    keyword: "rank sports movies",
    title: "Sports Movie Tier List",
    description:
      "Rocky vs Hoosiers. Remember the Titans vs The Sandlot. Rank the greatest sports films head-to-head and crown the champion.",
    variants: ["sports movie ranking", "best sports films ranked"],
    related: ["movies/action", "sports/athletes-goat", "movies/90s"],
  },
  "sports/stadiums": {
    keyword: "rank stadiums",
    title: "Stadium Tier List",
    description:
      "Madison Square Garden vs Camp Nou. Wembley vs Lambeau. Rank the world's most iconic stadiums and arenas head-to-head.",
    variants: ["stadium ranking", "best arenas ranked"],
  },
  "sports/esports-games": {
    keyword: "rank esports games",
    title: "Esports Game Tier List",
    description:
      "League of Legends vs Counter-Strike. VALORANT vs Dota 2. Rank the biggest esports titles head-to-head and build your tier list.",
    variants: ["esports tier list", "competitive game ranking"],
    related: ["random/video-games", "sports/sports-brands", "tv/anime"],
  },
  "sports/sports-brands": {
    keyword: "rank sports brands",
    title: "Sports Brand Tier List",
    description:
      "Nike vs Adidas. Jordan vs Puma. Under Armour vs New Balance. Rank athletic brands head-to-head and settle the sneaker argument.",
    variants: ["sportswear tier list", "athletic brand ranking"],
  },

  // ==========================================================
  // RANDOM
  // ==========================================================
  "random/dog-breeds": {
    keyword: "dog breed tier list",
    title: "Dog Breed Tier List Maker",
    description:
      "Golden Retriever vs Labrador. Corgi vs Husky. German Shepherd vs Frenchie. Rank 32 dog breeds head-to-head and find your favourite.",
    variants: ["rank dog breeds", "best dog breed ranking"],
  },
  "random/cities": {
    keyword: "rank cities",
    title: "Best Cities Tier List",
    description:
      "New York vs Tokyo. London vs Paris. Barcelona vs Sydney. Rank the world's great cities head-to-head and see where you'd really live.",
    variants: ["city tier list", "best cities ranked"],
  },
  "random/superpowers": {
    keyword: "rank superpowers",
    title: "Superpower Tier List",
    description:
      "Flight vs invisibility. Teleportation vs time travel. Rank superpowers head-to-head and find out which one you'd actually pick.",
    variants: ["superpower tier list", "best superpowers ranked"],
    related: [
      "random/marvel-characters",
      "movies/superhero",
      "movies/marvel",
    ],
  },
  "random/decades": {
    keyword: "rank decades",
    title: "Decade Tier List: Rank the Eras",
    description:
      "The 60s vs the 80s. The 90s vs the 2000s. Rank the decades head-to-head and find out which era you'd actually want to live through.",
    variants: ["best decade ranking", "decade bracket"],
  },
  "random/emoji": {
    keyword: "emoji tier list",
    title: "Emoji Tier List Maker",
    description:
      "Crying-laughing vs skull. Fire vs heart. Rank 32 emoji head-to-head and find out which one really deserves your keyboard's top row.",
    variants: ["rank emojis", "best emoji ranked"],
  },
  "random/board-games": {
    keyword: "board game tier list",
    title: "Board Game Tier List",
    description:
      "Catan vs Monopoly. Chess vs Scrabble. Ticket to Ride vs Risk. Rank board games head-to-head and settle the next games night.",
    variants: ["rank board games", "best board games ranked"],
    related: ["random/video-games", "sports/esports-games", "random/social-media"],
  },
  "random/holidays": {
    keyword: "rank holidays",
    title: "Holiday Tier List",
    description:
      "Christmas vs Halloween. Thanksgiving vs New Year's. Rank the holidays head-to-head and find out which one you actually look forward to.",
    variants: ["holiday tier list", "best holidays ranked"],
    related: ["movies/christmas", "food/candy", "food/desserts"],
  },
  "random/social-media": {
    keyword: "rank social media apps",
    title: "Social Media Tier List",
    description:
      "TikTok vs Instagram. YouTube vs Reddit. X vs Discord. Rank social platforms head-to-head and see which app really wins your time.",
    variants: ["social media tier list", "best apps ranked"],
  },
  "random/car-brands": {
    keyword: "car brand tier list",
    title: "Car Brand Tier List",
    description:
      "Tesla vs BMW. Porsche vs Ferrari. Toyota vs Honda. Rank car brands head-to-head and build the tier list your group chat needs.",
    variants: ["rank car brands", "best car brands ranked"],
  },
  "random/video-games": {
    keyword: "video game tier list",
    title: "Video Game Tier List Maker",
    description:
      "Breath of the Wild vs Elden Ring. Minecraft vs GTA V. Rank 32 of the greatest video games ever made through head-to-head matchups.",
    variants: ["rank video games", "greatest games ranked", "game sorter"],
    related: ["sports/esports-games", "random/board-games", "tv/anime"],
  },
  "random/disney-characters": {
    keyword: "Disney character sorter",
    title: "Disney Character Sorter",
    description:
      "Mickey vs Simba. Elsa vs Ariel. Woody vs Buzz. Sort 32 Disney characters into a personal ranking, one head-to-head pick at a time.",
    variants: ["Disney character tier list", "rank Disney characters"],
    related: ["movies/disney", "movies/pixar", "movies/animated"],
  },
  "random/marvel-characters": {
    keyword: "Marvel character sorter",
    title: "Marvel Character Sorter",
    description:
      "Spider-Man vs Wolverine. Iron Man vs Thor. Loki vs Doctor Strange. Sort 32 Marvel characters into your own ranking, matchup by matchup.",
    variants: ["Marvel character tier list", "rank Marvel characters"],
    related: ["movies/marvel", "movies/superhero", "random/superpowers"],
  },
  "random/zodiac-signs": {
    keyword: "zodiac sign tier list",
    title: "Zodiac Sign Tier List",
    description:
      "Leo vs Scorpio. Gemini vs Virgo. Rank all 12 zodiac signs head-to-head and find out which one you'd actually want to be.",
    variants: ["rank zodiac signs", "astrology tier list"],
  },
  "random/phobias": {
    keyword: "rank phobias",
    title: "Phobia Tier List: Rank Your Fears",
    description:
      "Heights vs spiders. Snakes vs enclosed spaces. Rank 16 common phobias head-to-head and find out what actually scares you most.",
    variants: ["phobia tier list", "scariest fears ranked"],
  },
  "random/inventions": {
    keyword: "rank inventions",
    title: "Greatest Invention Tier List",
    description:
      "The internet vs the printing press. Electricity vs the wheel. Rank humanity's greatest inventions through head-to-head matchups.",
    variants: ["greatest inventions ranked", "invention tier list"],
  },
};
