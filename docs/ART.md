# Mournwood — Art Pack (Midjourney prompt guide)

The game ships with cohesive CSS/emoji **fallbacks**, so it looks finished with no art.
To upgrade to a premium illustrated look, generate images in **Midjourney** and drop the PNG/WebP
files into `assets/` using the filenames below — the game picks them up automatically.

## Direction — "Dark Arcane"
Deep navy/purple world, **arcane-violet** glow, parchment cards, painterly fantasy, moody candlelight.

**Style descriptor (reuse on every prompt):**
> *painterly dark-fantasy illustration, deep arcane aesthetic, navy and purple palette, arcane-violet glow, parchment accents, moody candlelit lighting, mythic realism, TCG card art*

**Palette (hex):** bg `#0A0E27` / `#1A1A3A` / `#2D1B3D` · violet `#7D3FB8` / `#A855F7` · arcane-blue `#60A5FA`
· parchment `#E8D5C4` · gold `#D4AF97` · status red `#EF4444` / blue `#3B82F6` / green `#10B981` / amber `#FBBF24`.

## Midjourney recipe
1. Generate one strong reference image, then **lock a single `--sref <code>`** and reuse it everywhere for cohesion (`--sw 75–85`).
2. Use `--v 7`. Aspect ratios: portraits/cards `--ar 3:4`, region tiles `--ar 1:1`, key-art `--ar 16:9`. `--quality 2` for heroes/boss/title.
3. **Layered hero** (race × class = 9+9 art, not 81): generate 9 race **base** portraits with the same pose
   (use `--oref <base-url> --ow ~250` to lock pose/scale), then 9 class **kit** overlays on a flat background
   → cut to transparent PNG → composite the kit (95–105% scale) over the race base.
4. Export **WebP** (PNG fallback). Background removal: Midjourney editor or remove.bg.

## Asset slots (drop into `assets/…`)
| File | Prompt seed (append the style descriptor + flags) |
|---|---|
| `portraits/race-<id>.webp` ×9 | "noble <race> adventurer, heroic half-body, neutral pose, …" |
| `portraits/class-<id>.webp` ×9 | "<class> gear/weapon/aura kit on flat dark background, …" |
| `enemies/<id>.webp` | goblin/skeleton/dire wolf/bandit/orc/ashen cultist + elites — "menacing <enemy>, ¾ pose, …" |
| `enemies/high_priest.webp` | "ash-cult High Priest mid-ritual, violet tendrils, throne, epic, `--ar 3:4 --quality 2`" |
| `backgrounds/frame-attack|skill|power.webp` | ornate card frame, red/blue/violet accent, parchment, `--ar 2:3` |
| `tiles/town|forest|ruins.webp` | top-down region tile, tileable, `--ar 1:1` |
| `ui/title.webp` | "Mournwood key art, lone adventurer, arcane storm, `--ar 16:9 --quality 2`" |

## Example prompts
- **Race base (Elf):** `noble elf adventurer, half-body heroic pose, looking ahead, painterly dark-fantasy illustration, deep arcane aesthetic, navy and purple palette, arcane-violet glow, parchment accents, moody candlelit lighting, mythic realism, TCG card art --ar 3:4 --sref <CODE> --sw 80 --v 7`
- **Enemy (Goblin):** `green-skinned goblin skirmisher, jagged blade, snarling, three-quarter pose, dark navy background, [style descriptor] --ar 3:4 --sref <CODE> --sw 75 --v 7`
- **Boss (High Priest):** `ash-cult high priest mid-ritual, glowing violet eyes, ceremonial robes, floating runes, epic cinematic, [style descriptor] --ar 3:4 --sref <CODE> --sw 85 --quality 2 --v 7`
- **Region tile (Mournwood):** `corrupted forest floor, mossy roots, violet glowing vines, top-down tileable, [style descriptor] --ar 1:1 --sref <CODE> --sw 75 --v 7`

## Cohesion checklist
One `--sref` for the whole set · same style phrase + palette words · matching `--ar` per slot type ·
generate similar slots in one sitting · keep class kits 95–105% over the race base · export WebP < ~250 KB each.

## Credits to keep in-game
SRD 5.1 (CC-BY-4.0) flavour · game-icons.net (CC-BY-3.0) · Cinzel & Inter (OFL) · audio per README.
