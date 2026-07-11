# Image & Media Assets — IPickPickens.com

Every image on the site is currently a **placeholder SVG** (a `--tide-deep → --fog`
gradient labelled with its intended subject). Placeholders live in
`public/assets/`. To ship real imagery, drop your file into `public/assets/` and
update the one `src` reference (search the codebase for the placeholder filename).

## Direction for all photography
Photorealistic, **moody coastal Pacific Northwest**. Overcast, diffuse light.
Muted teal / gray colour grade to match the site palette. **No text or logos in
the image. No identifiable real people.** Natural, documentary feel — working
coast, not stock-photo gloss.

> ⚠️ **The candidate portrait (`portrait-hero`) must be a real photograph of
> C. Michael Pickens — never an AI-generated person.** Do not generate it.

---

## Replacement workflow (1:1)
1. Export your real image (JPG for photos, PNG where transparency is needed).
2. Save it into `public/assets/`. Easiest: keep the same base name, e.g.
   `roots-oysters.jpg`.
3. Search the repo for the placeholder path (e.g. `roots-oysters.svg`) and update
   the `src` to your new file (one line, in the relevant component).
4. `npm run build` to confirm.

Recommended: compress JPGs (~80% quality) and keep hero/roots images ≤ 300 KB.

---

## Asset inventory

| # | File (placeholder) | Real format | Dimensions / Aspect | Placement | Notes |
|---|---|---|---|---|---|
| 1 | ~~`portrait-hero.svg`~~ | — | — | Hero, right column | ✅ **DONE** — real photo in place (`portrait-hero.jpg`) |
| 2 | `og-image.svg` | **PNG** | 1200×630 (1.91:1) | Social share card (`<head>` meta) | Referenced in meta as `og-image.png` — supply a real PNG |
| 3 | `roots-oysters.svg` | JPG | 1200×800 (3:2) | Pacific County Roots strip | Willapa Bay oysters, South Bend |
| 4 | `roots-razor-clams.svg` | JPG | 1200×800 (3:2) | Roots strip | Razor clam digging at dawn, Long Beach |
| 5 | `roots-ilwaco-fleet.svg` | JPG | 1200×800 (3:2) | Roots strip | Ilwaco fishing fleet |
| 6 | `roots-cranberry-bog.svg` | JPG | 1200×800 (3:2) | Roots strip | Cranberry bog harvest |
| 7 | `roots-cedar-grove.svg` | JPG | 1200×800 (3:2) | Roots strip | Old-growth cedar, Long Island |
| 8 | `book-libertarian-leadership.svg` | JPG/PNG | 600×900 (2:3) | Books section | Real book cover — *Libertarian Leadership* |
| 9 | `book-liberated-mind.svg` | JPG/PNG | 600×900 (2:3) | Books section | Real book cover — *The Liberated Mind* |
| 10 | `favicon.svg` | SVG | 64×64 | Browser tab icon | Provided; replace with a real mark if desired |

## Real photos (already in place — do NOT replace with generated images)

| File | Dimensions | Placement | Subject |
|---|---|---|---|
| `canfield-interview.jpg` | 1437×617 | Featured section | Michael & Jack Canfield, interview wide shot |
| `canfield-titlecard.jpg` | 1466×610 | Featured section | Interview title card (Chief Empowerment Officer, Botanical Enlightenment) |
| `canfield-selfie.jpg` | 1080×1440 | Featured section | Michael with Jack Canfield |
| `about-deeohgee.jpg` | 1152×2048 | Livestream section | Michael & Dee Oh Gee (headset) on the livestream couch |
| `donate-deeohgee.jpg` | 2048×1153 | Donate section | Dee Oh Gee with the animated "meats and treats" speech bubble |
| `portrait-hero.jpg` | 1153×2048 | Hero portrait frame | Michael at a Pacific County fair with a George Washington reenactor |
| `about-2012.jpg` | 900×601 | About timeline thumbnail (2011 entry) | Black-and-white portrait |
| `about-2016.jpg` | 2048×1462 | About timeline thumbnail (2014 LPWA entry) | Speaking at the LPWA podium |
| `about-2018.jpg` | 2048×1365 | About timeline thumbnail (national-LP entry) | On stage, speaker badge |
| `about-2019.jpg` | 2048×1365 | About timeline thumbnail (Today entry) | Professional portrait (Brian J. Daniel Photography) |

> **Book covers (#8, #9)** are real published books — use the actual cover art,
> not a generated image.

---

## Ready-to-paste generation prompts

Use these for the *scenery* images only (#3–#7 and, optionally, #2 background).
**Do not** use generative AI for the candidate portrait or the book covers.

### #3 — Willapa Bay oyster beds (`roots-oysters`)
> Photorealistic wide shot of an exposed oyster bed at low tide on Willapa Bay
> near South Bend, Washington. Overcast Pacific Northwest morning, flat diffuse
> light, wet mudflats reflecting a pale gray-teal sky, weathered oyster stakes
> and clusters of shells stretching to a distant tree-lined shore. Muted teal and
> gray colour grade, documentary realism, no people, no text, no logos. 3:2.

### #4 — Razor clam digging at dawn (`roots-razor-clams`)
> Photorealistic dawn scene on the Long Beach Peninsula, Washington — the world's
> longest drivable beach. Wet flat sand mirroring an overcast pink-gray sky, a
> clam gun and a bucket resting on the sand, gentle surf in the distance. Cold
> muted coastal light, teal-gray grade, atmospheric and quiet, no identifiable
> people, no text, no logos. 3:2.

### #5 — Ilwaco fishing fleet (`roots-ilwaco-fleet`)
> Photorealistic view of commercial fishing boats moored at Ilwaco harbor,
> Washington, on an overcast morning. Weathered hulls, crab pots stacked on the
> dock, rigging and masts against a soft gray sky, calm water with muted
> reflections. Working-waterfront documentary style, teal-gray colour grade, no
> people, no text, no logos. 3:2.

### #6 — Cranberry bog harvest (`roots-cranberry-bog`)
> Photorealistic flooded cranberry bog at harvest on the Long Beach Peninsula,
> Washington. A crimson-red carpet of floating cranberries on dark water,
> low wooden bog berms, evergreen treeline under an overcast sky. The deep red
> berries are the only saturated colour against a muted teal-gray landscape.
> Realistic, no people, no text, no logos. 3:2.

### #7 — Old-growth cedar grove (`roots-cedar-grove`)
> Photorealistic old-growth western red cedar grove on Long Island in Willapa
> Bay National Wildlife Refuge, Washington. Massive fluted cedar trunks, ferns
> and moss on the forest floor, soft foggy light filtering through the canopy,
> cool green-gray tones. Ancient, still, reverent atmosphere. No people, no text,
> no logos. 3:2.

### #2 — OG social card background (optional, `og-image`)
> Photorealistic moody Willapa Bay coastline at dusk under overcast sky, wide
> horizontal composition with generous empty sky for text overlay, muted
> teal-gray grade, no people, no text, no logos. 1200×630.
>
> (Then overlay the wordmark "I Pick Pickens" and "C. Michael Pickens ·
> Pacific County Commissioner · 2028" in the campaign fonts before exporting.)

---

## Colour reference (for graders / designers)
- Deep water teal: `#0D2B30`
- Fog white: `#EDF0EC`
- Driftwood: `#BCB3A2`
- Gold (primary accent): `#C1953F` · bright (on dark): `#D8B25A` · deep (text on light): `#7A5E1B`
- Salmon-copper: `#C97F5D`
- Cedar: `#241F17`
