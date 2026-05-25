# Mournwood

A high-end, phone-first **PWA roguelite card adventure**. Explore the vale of **Aldermoor** with
free top-down movement, complete quests, and fight through **Slay-the-Spire-style deckbuilding
combat** toward the **High Priest of Ash**. Roguelite (Hades-style): lose a battle and the story
still advances; permanent unlocks carry between attempts.

> Built in vanilla **HTML/CSS/JS** (ES modules) — **no build step**. Just serve the folder.

## Run it
```bash
python3 -m http.server 8099 --directory .
# then open http://localhost:8099/
```
Installable as a PWA and playable offline (service worker caches the app shell + assets).

## Tech
- Vanilla ES modules, DOM/CSS for cards + UI, canvas for the map/particles.
- Vendored libs in `js/vendor/`: GSAP (animation), Howler (audio), idb-keyval (saves) — offline-safe.
- Deterministic seeded RNG (`js/rng.js`) so runs/bugs are reproducible & shareable.

## Project layout
- `index.html`, `manifest.json`, `sw.js` — app shell + PWA.
- `css/` — dark-arcane design system. `js/` — game code. `js/data/` — content data.
- `assets/` — drop-in art (Midjourney); the game ships graceful CSS/emoji fallbacks.
- `test/` — Node unit tests + headless fuzzer/balance simulator.

## Art
Art is generated in **Midjourney** and dropped into `assets/`. A full prompt pack + style guide
(`--sref` recipe, palette, layered race+class hero system) lives in `docs/ART.md` (Phase 6).

## Credits & licenses (in-game Credits screen)
- Rules/monsters flavour inspired by the **SRD 5.1**, © Wizards of the Coast, **CC-BY-4.0**
  (original world, cult, and character names are our own).
- Icons: **game-icons.net** (CC-BY-3.0). Fonts: **Cinzel** & **Inter** (OFL, Google Fonts).
- Music: **Eric Matyas / soundimage.org** (attribution) + OpenGameArt CC0. SFX: **Kenney.nl** (CC0).

## Status
Vertical slice **complete & playable**: title → save slots → race/class select → Hearthvale hub →
free-roam Mournwood (joystick) → combat / shop / rest / events / Ward-Stone → 3-phase boss → ending.
9 classes × 9 races, relics, potions, multi-slot saves, settings/QoL, offline PWA. Art via `docs/ART.md`.

Test it: `python3 -m http.server 8099 --directory .` · run tests: `node --test test/` · balance fuzzer: `node test/fuzzer.mjs`.
