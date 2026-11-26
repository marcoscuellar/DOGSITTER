# LEON'S — The Club · Brand Spec

Hotel & day club for dogs · Uptown, Chicago
Tagline: **Your dog is on the list.**

Claude Code: treat this file as the source of truth. Exact values live in `leons-club-brand.css`. Logos live in `logos/`. Use them as they are, and don't redraw anything. The PDF in `brand-book/` shows the same rules visually.

---

## 1. Name
- Always **LEON'S**, with a curly apostrophe (’). Uppercase in logos and headlines, "Leon's" in sentences.
- Leon is the owner and host. The dog in the logo is not named.

## 2. Logos (`logos/`)
| Use | File |
|---|---|
| Default (header, signage) | `leons-logo-primary-ink.svg` (transparent), `-dark.svg` (on Ink panel), `-light.svg` (on Bone panel) |
| Square spaces / avatars | `leons-logo-stacked-ink.svg`, `leons-logo-stacked-bone.svg` |
| Name only | `leons-wordmark-ink.svg`, `-bone.svg`, `-cognac.svg` |
| Small spots under 48px, nav, favicon | `leons-head-mark-ink.svg`, `leons-head-mark-bone.svg` |
| Seal / stamp | `leons-monogram-ink.svg` |
| App icon | `leons-app-icon-1024.svg` (square, Ink background, Bone head) |
| Full dog drawing only | `leons-dog-for-light-bg.svg`, `leons-dog-for-dark-bg.svg` |

PNG exports (1x and @2x) are in `logos/png/`. All lettering in the SVGs is already converted to outlines.

**Rules**
- Clear space: the height of the "L" on every side.
- Minimum sizes: primary 160px wide, stacked 96px wide, head mark 24px wide.
- Ink logo on Bone or White. Bone logo on Ink or Cognac.
- Never stretch, rotate, recolor (no neon), add effects, retype the name or put it on a busy photo.

## 3. Color
| Token | Hex | Use | Share |
|---|---|---|---|
| `--leons-ink` | `#0E0E0E` | Backgrounds, main text | 55% |
| `--leons-bone` | `#EDE8DF` | Page background, text on Ink | 30% |
| `--leons-cognac` | `#8A4A1F` | Primary buttons, accents, links | 10% |
| `--leons-tan` | `#D08A4E` | Small labels **on Ink only** | 5% |
| `--leons-white` | `#FFFFFF` | Cards and inputs on Bone | — |
| `--leons-ink-2` | `#161616` | Raised surface on Ink | — |
| `--leons-line` | `#2A2A2A` | Borders on Ink | — |

Contrast: Bone on Ink 15.8:1 · Cognac on Bone 5.6:1 · Bone on Cognac 5.6:1 · Tan on Ink 6.8:1.
**Never put Tan text on Bone (2.3:1 fails).**

## 4. Type (Google Fonts)
- **Anton**: display. Always UPPERCASE, line-height 0.95, tracking +1%. Use it for headlines, names and buttons.
- **Newsreader** 400 + italic 400: body text. Use italic for warm sub lines. Line-height 1.5.
- **IBM Plex Mono** 400/500: labels. UPPERCASE, 11–13px, letter-spacing 0.2em. Use it for eyebrows, dates and room numbers.

Scale: Hero clamp(56px, 12vw, 120px) · H1 48 · H2 32 · H3 22 (all Anton) · Body 17 (Newsreader) · Label 11 (Plex Mono).

## 5. App UI
- **Corners: 0px everywhere.** Only the app icon is rounded, and the app store does that.
- Borders: 2px Ink. Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48.
- Tap targets: 52px minimum.
- **Buttons** use Anton 18px in caps:
  - Primary: Cognac fill with Bone text
  - Secondary: transparent with a 2px Ink outline
  - On an Ink background: 2px Bone outline
  - Focus: 3px Tan outline with a 3px offset
- **Cards:** White with a 2px Ink border on a Bone page. "Dark moment" cards (check-in status, member card, report header) are Ink with Bone text and Tan labels.
- **Patterns** are only for empty states, the member card and the splash screen. Never put them behind body text.

## 6. Patterns
1. **Monogram**: `logos/leons-pattern-monogram-tile.svg` (160px tile). In the app, use a dark version (L + head in `#3A3530` on Ink).
2. **Hatch**: diagonal lines from the dog's ears. `logos/leons-pattern-hatch-tile.svg` or CSS class `.leons-pattern-hatch`.
3. **Awning**: Ink/Bone stripe with a Cognac pinstripe. `logos/leons-pattern-awning-tile.svg` or `.leons-pattern-awning`.
4. **Guest List**: rows of "LEON'S · GOOD DOGS ONLY · UPTOWN" in Anton. Marketing only, not app UI.

Use one pattern at a time, and never mix them.

## 7. Icons (`icons/`)
- 36 icons on a 24px grid with a 2px stroke, round caps and joins, and `currentColor`, so they take on the text color.
- Files: `icons/leons-icon-<name>.svg`, plus a sprite `icons/leons-icons-sprite.svg` (use `<use href="#leons-<name>">`). Preview: `icons/leons-icons-preview.png`.
- Names: home, bookings, dog, messages, account, walk, day-club, hotel-stay, overnight, care-instructions, medication, meals, camera, photos, check-in, drop-off, checklist, bell, settings, schedule, start-walk, end-walk, bag, concern, approve, decline, payment, notes, private-note, phone, play-group, member-card, add, arrow-right, back, close.
- Ink on light backgrounds, Bone on Ink. Cognac only on the active tab. Keep the stroke at 2px. Never fill icons, never use emoji, and no paw-print icons.
- The app icon is the full sitting dog (`logos/leons-app-icon-1024.svg`). For small spots, the head mark is the real dog's head with striped ears.

## 8. Photography
- Real dogs, real rooms. Shoot at the dog's eye level in natural light, in Leon's own suites and play areas.
- Two treatments: **black-and-white** (high contrast) for credentials, member cards and hero moments, and **natural warm color** for day-to-day app updates and day passes.
- Frame the face. Crop tight on the eyes, and leave room for Anton headlines over Ink panels, never over the photo itself.
- No costumes, no stock-photo studio backdrops, no filters beyond black-and-white.
- Placeholder until the photoshoot: `luna-guest.webp` (sample from the Guest Studio app).

## 9. Voice
- **Say:** "Your dog is on the list." · "Checked in. Suite 04." · "See you at the club." · "We'll hold the room."
- **Skip:** puns, "fur-babies," exclamation points, emoji, UI copy longer than two lines.
- **How a message is built:** a big Anton line says what happened, then a small italic line says what's next.

| Moment | Headline | Sub line |
|---|---|---|
| Booking sent | REQUEST RECEIVED | We'll confirm within [TIME]. |
| Check-in | CHECKED IN | Suite 04. Settling in nicely. |
| Empty state | NOTHING BOOKED YET | Your dog is on the list — pick a date. |
| Error | THAT DIDN'T GO THROUGH | Try again, or call the desk at [PHONE]. |

Anything in [brackets] is a placeholder for real data. Don't make up times, prices or phone numbers.
