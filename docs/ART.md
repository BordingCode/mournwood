# Mournwood — Art Pack (Midjourney prompt guide)

The game ships with cohesive **SVG-icon + CSS fallbacks**, so it looks finished with no art at all.
To upgrade to a premium illustrated look, generate images in **Midjourney** and drop the WebP files
into `assets/…` using the exact filenames below.

> **Two steps to light up a slot:** ① save the file at the exact path, **and** ② add that path to
> `assets/manifest.json`. The loader only requests files listed in the manifest — so empty slots make
> **zero** network requests, and a missing/!listed file silently falls back to its SVG icon. (See
> `js/art.js`.) Example manifest after adding two files:
> ```json
> ["portraits/wizard.webp", "enemies/high_priest.webp"]
> ```
> Paths in the manifest are **relative to `assets/`** (no leading `assets/`).

## Direction — "Dark Arcane"
Deep navy/purple world, **arcane-violet** glow, parchment cards, painterly fantasy, moody candlelight.

**Style descriptor (reuse on every prompt):**
> *painterly dark-fantasy illustration, deep arcane aesthetic, navy and purple palette, arcane-violet glow, parchment accents, moody candlelit lighting, mythic realism, TCG card art*

**Palette (hex):** bg `#0A0E27` / `#1A1A3A` / `#2D1B3D` · violet `#7D3FB8` / `#A855F7` · arcane-blue `#60A5FA`
· parchment `#E8D5C4` · gold `#D4AF97` · status red `#EF4444` / blue `#3B82F6` / green `#10B981` / amber `#FBBF24`.

## Midjourney recipe
1. Generate one strong reference image, then **lock a single `--sref <code>`** and reuse it everywhere for cohesion (`--sw 75–85`).
2. Use `--v 7`. Aspect ratios: portraits/enemies `--ar 3:4`, hero token `--ar 1:1`, backgrounds/key-art `--ar 16:9`. `--quality 2` for heroes/boss/title.
3. Export **WebP**, target **< ~250 KB** each. Background removal (for portraits/hero token): Midjourney editor or remove.bg.

## Asset slots — these exact paths are wired in code
Generate any subset; each missing one just keeps its SVG fallback. Filenames must match **exactly**.

| File (under `assets/`) | Count | Where it shows | Prompt seed (+ style descriptor + flags) |
|---|---|---|---|
| `ui/title.webp` | 1 | Title screen background | "Mournwood key art — lone hooded adventurer before an ash-storm over a violet forest, cinematic `--ar 16:9 --quality 2`" |
| `backgrounds/combat.webp` | 1 | Behind every fight (the "stage") | "moody dark-fantasy battleground, mist, violet light shafts, ruined stones, empty foreground, atmospheric `--ar 16:9`" |
| `portraits/<race>.webp` | 9 | Race-select card | "noble \<race\> adventurer, heroic half-body, neutral pose, dark navy backdrop `--ar 3:4`" |
| `portraits/<class>.webp` | 9 | Class-select card | "\<class\> hero with signature weapon/aura, half-body, dark backdrop `--ar 3:4`" |
| `portraits/hero-<class>.webp` | 9 | Hero token on the overworld map | "\<class\> adventurer full-body token, top-down-friendly, centered, transparent/flat bg `--ar 1:1`" |
| `enemies/<id>.webp` | 9 | Enemy/elite/boss portrait in combat | "menacing \<enemy\>, three-quarter pose, dark navy background `--ar 3:4`" |

**`<race>`** = `human elf dwarf halfling gnome halforc dragonborn tiefling goliath`
**`<class>`** = `fighter barbarian rogue ranger wizard sorcerer cleric druid paladin`
**`enemies/<id>`** = `goblin` · `skeleton` · `direwolf` (Dire Wolf) · `bandit` · `orc` (Orc Raider) ·
`cultist` (Ashen Cultist) · `orc_berserker` (elite) · `cult_zealot` (elite) · `high_priest` (boss).

> **Not art slots (CSS-rendered, don't generate):** card frames (parchment + per-type accent bar) and
> the map biome bands/scenery (town → woods → ruins) are drawn in CSS/SVG. There is no image loader
> for them, so any files you drop there are ignored.

## Example prompts
- **Race base (Elf):** `noble elf adventurer, half-body heroic pose, looking ahead, painterly dark-fantasy illustration, deep arcane aesthetic, navy and purple palette, arcane-violet glow, parchment accents, moody candlelit lighting, mythic realism, TCG card art --ar 3:4 --sref <CODE> --sw 80 --v 7` → save as `portraits/elf.webp`
- **Class kit (Wizard):** `wizard hero channeling violet arcane fire, half-body, dark backdrop, [style descriptor] --ar 3:4 --sref <CODE> --sw 80 --v 7` → `portraits/wizard.webp`
- **Enemy (Dire Wolf):** `gaunt corrupted dire wolf, violet-glowing eyes, snarling, three-quarter pose, dark navy background, [style descriptor] --ar 3:4 --sref <CODE> --sw 75 --v 7` → `enemies/direwolf.webp`
- **Boss (High Priest):** `ash-cult high priest mid-ritual, glowing violet eyes, ceremonial robes, floating runes, epic cinematic, [style descriptor] --ar 3:4 --sref <CODE> --sw 85 --quality 2 --v 7` → `enemies/high_priest.webp`
- **Combat background:** `dark-fantasy battlefield, drifting ash, violet light through dead trees, empty foreground for characters, [style descriptor] --ar 16:9 --sref <CODE> --sw 75 --v 7` → `backgrounds/combat.webp`

## Layered hero trick (optional — 18 art, not 81)
You don't need a portrait per race×class. Generate the 9 **race** portraits and 9 **class** portraits
separately (above). The race/class **select** screens each show their own; the in-run identity reads as
"\<Race\> \<Class\>" in text. If you later want true composites, lock pose with `--oref <base-url> --ow ~250`
and overlay a transparent class kit (95–105% scale) over each race base.

## Cohesion checklist
One `--sref` for the whole set · same style phrase + palette words · matching `--ar` per slot type ·
generate similar slots in one sitting · export WebP < ~250 KB each · **remember to add each path to
`assets/manifest.json`.**

## Credits to keep in-game
SRD 5.1 (CC-BY-4.0) flavour · game-icons.net style SVGs (CC-BY-3.0) · Cinzel & Inter (OFL) · audio per README.
