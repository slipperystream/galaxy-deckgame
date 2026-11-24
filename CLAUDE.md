# Galaxy Deck Drafter

A learning project: a lightweight web app for drafting a 12-card deck for the game
*Once Upon a Galaxy*. The user is building it to learn front-end development from
scratch. **Claude's role is tutor, not author.**

## The app
A "-dle"-style site (think Wordle): one shared daily run, plus endless play.

### Core draft loop
- The player sees a "shop" of 3 cards. Hovering a card shows its ability; clicking
  adds it to the deck. The other two disappear and a new shop of 3 appears.
- Repeat until the deck has 12 cards, then show the final deck.

### Tabs (top of page)
- **Daily**: a seeded run that is the same for every player on a given day.
  Progress/completion is saved locally (e.g. `localStorage`) so revisiting the page
  shows the finished run. No backend; if someone loses it and replays, that's fine.
  No comparing results with other players for now.
- **Endless**: unlimited runs with random seeds.
- **Custom**, **Sync**: placeholder "coming soon" only. Not part of the MVP.

### Seeds and rulesets (user's current idea)
- A **ruleset** is JSON describing a run's parameters; a **seed** drives a seeded
  random number generator so the same seed + ruleset produces identical shops.
- The daily seed can be derived from the date, so nothing needs generating or
  uploading each day. (Open question: local vs UTC midnight.)
- Example ruleset the user sketched (format not final, will likely grow):
  ```json
  {
    "starters": ["Mimic", "Wormscale Tinkerer"],
    "default": { "pick": 1, "of": 3, "set": ["!Candylar"] }
  }
  ```
  - `starters`: cards the deck begins with (here 2, so the player picks 10 more).
  - Individual steps may be specified; any step without its own rules falls back
    to `default`; anything not specified in `default` is pure random.
  - `"!Candylar"` means exclude the Candylar set.

### Card data
- Current data: a small hand-written JSON file of ~15–20 fake cards. No real card
  data and no scraping yet.
- Later plan: scrape real card data once into a static JSON shipped with the site,
  re-run manually after game updates. A scheduled job (GitHub Actions / Netlify
  scheduled functions) to refresh it automatically is a possible later upgrade.

Possible future ideas (scope undecided, do not build toward them unprompted):
swap phase after the draft, shop templates (pure random / "realistic" rarity
spread / keyword-only), captain selection, stats on what everyone picked in the
daily, animations, loading the player's collection file so shops only show owned
cards, Custom and Sync tabs.

## Stack
- Vite + **TypeScript** (chosen; user's background is Java/C) + plain CSS. No
  framework for now (may port to Svelte later).
- Hosting: Netlify (not set up yet). GitHub Pages was discussed as an alternative.
  Custom domain undecided.
- Repo: github.com/slipperystream/galaxy-deckgame (branch `master`). `gh` CLI is
  installed and authenticated over HTTPS.

## Architecture
- No architecture has been decided, and none should be handed to the user.
- Build the simplest version of the core loop first and let structure emerge.
- Do not suggest abstractions or patterns upfront.
- When the code gets tangled as features are added, point it out and help the user
  reason through a restructure, but let them drive.
- If the user is about to paint themselves into a corner that would be painful to
  undo, a short heads-up is fine.

## How to work with the user
- **Setup, installs, tooling, config:** help freely, but explain what each command
  does and what each generated file is for.
- **Feature code:** do NOT write it unless the user explicitly asks.
- **Teaching new concepts:** explain directly rather than sending the user off to
  search. Use small, generic examples (not the user's actual feature code) and
  include a link to the relevant docs (MDN, javascript.info, Vite docs) for depth.
  The user applies the concept to their own code.
- **When the user is stuck on their own code**, escalate in this order:
  1. Give a hint.
  2. Point to the specific concept/docs that apply.
  3. Scaffold: give the type/signature/skeleton with the body left as comments,
     and list which already-taught pieces fill each gap. The user asked for this
     explicitly — "don't give me the full answer straight away but make it like,
     obvious what i should do/think about." This rung is usually the right one.
  4. Only then show the full code — but if they ask plainly more than twice
     ("walk me through it", "i'm struggling"), stop hinting and show it.
- **Pace:** the user knows programming basics (indexing, loops, fields, etc.) —
  skip those and focus on what's new about front-end / JS / TS.
- **Small steps:** break work into small steps that each end with something
  visible/verifiable. Big "combine these building blocks" jumps lose the user.
  When they say "walk me through exactly", give concrete step-by-step
  instructions with snippets (especially for HTML/CSS syntax, which is new to them).
- **Verify before asserting:** when unsure how TS or CSS behaves (e.g. null
  narrowing, percentage heights), test it in the scratchpad first. Earlier claims
  had to be corrected.
- **Reviewing:** read the user's files directly and run `npx tsc --noEmit` rather
  than asking them to paste code.
- **Before the user builds a feature**, ask how they would approach it.
- **Code review:** review what the user writes and explain *why* something is
  wrong. Let them make the fixes; don't edit their feature code for them.
- **Level:** explain at a junior-dev level. The user works in production support,
  so they're not new to code, but they're new to building a front end from scratch.

## Current status (update as work progresses)
Last updated: 2026-11-22.

**Built so far** (all in `src/main.ts`, `src/style.css`, `index.html`):
- Data: `src/cards.json`, 20 cards with fields `id, name, image, types, rarity,
  attack, health, ability, set, keywords`. `type Card = (typeof cards)[number]`.
  Images are remote URLs on the game's server (~24KB each).
- Core loop works: `randShop(shopSize, exclusions)` picks from a copy of the pool;
  `newCard(card)` is the shared card-element builder (button + img + hover →
  `drawCardInfo`); `drawShop` adds the click; `drawDeck` redraws from a sorted copy
  (`toSorted`) so `deckCards` stays in pick order; the shop clears at 12 cards.
- Layout: black page locked to the viewport (`100dvh`, `overflow: hidden`, flex
  column, `margin: 0`, border-box). Bands: tabs (buttons, no logic yet) → shop
  (30vh, flex row) → info (`flex: 1`, ability text with `white-space: pre-line`)
  → deck (6×2 grid sized by `--card-h` variable) → types (empty). Cards use
  `min(vh, vw)` sizing and `aspect-ratio`. Hover: scale/translate + pulse animation.

- Next-shop preloading **done**: the two loops in `drawShop` are merged, so each
  shop card's click listener closes over its *own* pre-generated next shop (built
  with that card excluded). Fixed a bug where a picked card reappeared in the next
  shop and `indexOf` → `-1` → `splice(-1, 1)` removed the wrong card. A guard now
  throws if `indexOf` returns -1.

**In progress:** colored text in the info area. Design decided with the user
(2026-11-22); implementation barely started (`colorCardInfo` is a stub).
- **Detection happens at render time in `main.ts`, not during the webscrape.**
  Reason: the `keywords` field in `cards.json` was hand-curated (Claude read the
  ability text), *not* free from the site — so storing it per-card costs the same
  as detecting it in code. Render-time also means adding a new card automatically
  updates highlighting in every existing card's ability text, with no re-tagging.
- **Four scan-lists**, each paired with a CSS class: keywords, card names, types,
  rarities. All four are scanned *inside* ability text (type and rarity names show
  up in free text, e.g. "another Fae or Animal"). Card names derive from
  `cards.json`; keywords/types/rarities are hardcoded consts for now (types to be
  scraped later from the site's type-filter dropdown). The per-card `keywords`
  field is being dropped.
- Name-matching scope is deliberately limited to cards in `cards.json`. Tokens,
  treasures and spells are not in the data and stay plain text for now.
- **`colorCardInfo(ability)` returns data, not DOM**: `type Piece = { text: string,
  className: string | null }`, returned as `Piece[]` in text order. `drawCardInfo`
  turns pieces into spans. Rationale the user reasoned out: pure string→data is
  debuggable with `console.log` and needs no DOM.
- Algorithm the user worked out: (1) each scan yields matches with text + start/end
  index (`matchAll` + `match.index`); (2) aggregate all matches from all lists;
  (3) sort by start index; (4) walk with a cursor from 0, pushing the plain-text
  gap before each match, then the match with its class, then moving the cursor to
  the match end; push the trailing text at the end.
- Avoid `innerHTML` throughout; `Element.append()` takes strings and makes text
  nodes safely.
- Deliberately deferred (do not raise unprompted until the keyword rule works):
  overlapping/substring matches (type `Fae` inside `Faerie`, card name
  `Dragon Claw` vs type `Dragon`) which will need word boundaries; and
  stat-number patterns (`+1/+1`, `+20 Attack`) — one regex per format actually
  seen in the data, not a universal one.

**Next up:** build it one rule at a time, each verified before the next: keywords
only → stat numbers → types → card names. Separately, rarity and types also need
to display as standalone tags below the ability (known field → class name, no
scanning needed for that usage) — that display got dropped from `drawCardInfo`
during the rewrite and needs re-adding.

**Later:** tab switching, seeded RNG + daily mode, dummy ruleset, staggered
"new shop" animation (will need `async`/`await`), mobile sizing for 1–5 card
shops, hosting images ourselves.

**Open design questions (user's call):**
- Tabs: does each tab keep its own in-progress game, or does switching start fresh?
- Should cards shown/passed in a shop be excluded from later shops?
- Daily mode: same shops for everyone vs. same start (picks change later shops);
  local vs UTC midnight.
