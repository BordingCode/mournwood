#!/usr/bin/env python3
"""Generate Mournwood's art assets from Pollinations.ai (free Flux text-to-image).
Resumable: skips files that already exist. Converts to WebP, resizes to keep small.
Run from repo root: python3 tools/gen_art.py
"""
import os, io, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, "assets")

# Cohesive house style appended to every character/enemy prompt.
PORTRAIT_STYLE = ("solo character, centered half body portrait, dark navy background, "
    "painterly dark fantasy illustration, deep arcane aesthetic, navy and purple palette, "
    "violet magical glow, parchment accents, moody candlelit lighting, mythic realism, "
    "fantasy trading card art, highly detailed, sharp focus")
ENV_STYLE = ("painterly dark fantasy environment concept art, navy and purple palette, "
    "violet magical glow, moody atmospheric fog, cinematic lighting, highly detailed, no text")

# slot -> (prompt-core, seed). Style added per kind below.
ENEMIES = {
  "goblin":        "a snarling green-skinned goblin skirmisher gripping a jagged rusty blade, leather scraps, sharp teeth",
  "skeleton":      "an undead skeleton warrior with glowing violet eye sockets, cracked yellowed bones, tattered grave shroud, rusty sword",
  "direwolf":      "a gaunt corrupted dire wolf beast with glowing violet eyes, bristling black fur, bared dripping fangs, menacing",
  "bandit":        "a hooded human bandit with a curved dagger, worn leather armor, scarred sneering face, shadowy",
  "orc":           "a brutish muscular orc raider with tusks and warpaint, hefting a heavy notched axe, snarling",
  "cultist":       "an ashen cultist in a grey hooded robe holding a ritual candle and dagger, sunken hollow eyes, ash smeared",
  "orc_berserker": "a massive hulking orc berserker champion wielding two great axes, battle scars, glowing red eyes, furious roar",
  "cult_zealot":   "a fanatic cult zealot conjuring burning violet fire in both hands, ceremonial ashen robes, blazing eyes",
  "high_priest":   "an ash cult high priest mid ritual, glowing violet eyes, hooded ceremonial ashen robes, floating runes, epic cinematic villain",
}
RACES = {
  "human":      "a noble human adventurer, determined face, leather and cloth travel armor",
  "elf":        "an elegant high elf adventurer with long pointed ears, flowing hair, refined ornate armor",
  "dwarf":      "a stout dwarf adventurer with a thick braided beard, heavy plate armor, axe on back",
  "halfling":   "a cheerful halfling adventurer, curly hair, small stature, rugged traveler clothes",
  "gnome":      "a clever gnome adventurer with large bright eyes, brass tinkerer goggles, colorful coat",
  "halforc":    "a rugged half-orc adventurer with green-grey skin and small tusks, muscular, fierce",
  "dragonborn": "a dragonborn adventurer, draconic scaled reptilian humanoid head, proud, noble armor",
  "tiefling":   "a tiefling adventurer with curved horns and violet skin, glowing eyes, infernal heritage",
  "goliath":    "a towering goliath adventurer, stone-grey skinned giant humanoid with tribal glowing tattoos",
}
CLASSES = {
  "fighter":   "an armored human fighter holding a sword and shield, disciplined stalwart warrior",
  "barbarian": "a fierce barbarian warrior raising a massive great axe, fur pelts and warpaint, raging",
  "rogue":     "a hooded rogue twirling twin daggers, dark leather armor, sly stealthy assassin",
  "ranger":    "a ranger archer drawing a longbow, green hooded cloak, quiver of arrows, forest scout",
  "wizard":    "a wizard channeling violet arcane fire from a glowing staff, robes and pointed hat, spellbook",
  "sorcerer":  "a sorcerer crackling with chaotic violet arcane energy swirling around the hands, dramatic",
  "cleric":    "a holy cleric raising a glowing mace and shield, divine radiant light, ornate robes",
  "druid":     "a druid holding a gnarled wooden staff, antlers and leaves in hair, green nature magic",
  "paladin":   "a paladin in shining ornate plate armor holding a glowing holy sword, radiant aura",
}
BACKGROUNDS = {
  "backgrounds/combat": ("a haunted misty ruined forest clearing battleground, violet light shafts through "
      "dead twisted trees, drifting ash, broken stone ruins, empty foreground with no characters, "
      "wide cinematic landscape, " + ENV_STYLE, 1280, 720, (1024, 576)),
  "ui/title":           ("epic fantasy poster key art, a lone hooded adventurer standing on a ridge before a "
      "vast haunted violet forest under a swirling ash storm, dramatic cinematic, " + ENV_STYLE, 1280, 720, (1024, 576)),
}

def fetch(prompt, w, h, seed):
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt)
           + f"?width={w}&height={h}&seed={seed}&model=flux&nologo=true&enhance=false")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=180).read()

def make(path, prompt, w, h, seed, final, q=80):
    full = os.path.join(A, path + ".webp")
    if os.path.exists(full) and os.path.getsize(full) > 2000:
        print("  skip (exists):", path); return True
    os.makedirs(os.path.dirname(full), exist_ok=True)
    from PIL import Image
    for attempt in range(4):
        try:
            data = fetch(prompt, w, h, seed)
            img = Image.open(io.BytesIO(data)).convert("RGB")
            if final: img = img.resize(final, Image.LANCZOS)
            img.save(full, "WEBP", quality=q, method=6)
            print(f"  ok: {path}.webp  {img.size}  {os.path.getsize(full)//1024}KB")
            return True
        except Exception as e:
            print(f"  retry {attempt+1} {path}: {e}"); time.sleep(3 + attempt*3)
    print("  FAILED:", path); return False

def run():
    n_ok = 0; seed = 100
    print("ENEMIES");
    for k, core in ENEMIES.items():
        seed += 1; n_ok += make(f"enemies/{k}", f"{core}, {PORTRAIT_STYLE}", 768, 1024, seed, (512, 683))
        time.sleep(0.6)
    print("RACES")
    for k, core in RACES.items():
        seed += 1; n_ok += make(f"portraits/{k}", f"{core}, {PORTRAIT_STYLE}", 768, 1024, seed, (512, 683))
        time.sleep(0.6)
    print("CLASSES")
    for k, core in CLASSES.items():
        seed += 1; n_ok += make(f"portraits/{k}", f"{core}, {PORTRAIT_STYLE}", 768, 1024, seed, (512, 683))
        time.sleep(0.6)
    print("BACKGROUNDS")
    for path, (prompt, w, h, final) in BACKGROUNDS.items():
        seed += 1; n_ok += make(path, prompt, w, h, seed, final, q=82); time.sleep(0.6)
    # hero map tokens = reuse the class portrait (same character, shown small in a circle)
    print("HERO TOKENS (copy of class portraits)")
    import shutil
    for k in CLASSES:
        src = os.path.join(A, f"portraits/{k}.webp"); dst = os.path.join(A, f"portraits/hero-{k}.webp")
        if os.path.exists(src): shutil.copyfile(src, dst); print("  copied hero-"+k);
    print(f"\nDONE — {n_ok} generated.")

if __name__ == "__main__":
    run()
