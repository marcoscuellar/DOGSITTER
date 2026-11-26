# LEON'S — Handoff for Claude Code

Hotel & day club for dogs · Uptown, Chicago · Owner and host: **Leon**
Brand direction: **02 — The Club**

## Read in this order
1. `LEONS-BRAND-KIT/BRAND.md`: every brand rule. This is the source of truth.
2. `ux/leons-user-journey.html`: what the app does. It covers two experiences (pet owner and Leon's care desk), the journeys, the shared workflow and the open items.
3. `design-reference/`: what the screens and passes should look like.
4. `LEONS-BRAND-KIT/leons-club-brand.css`: use these tokens. Don't hard-code colors.

## What's in here
| Folder | What it is |
|---|---|
| `LEONS-BRAND-KIT/BRAND.md` | Brand rules: name, logos, color, type, UI, patterns, icons, photography, voice |
| `LEONS-BRAND-KIT/leons-club-brand.css` | CSS variables, buttons, cards, Hatch and Awning patterns |
| `LEONS-BRAND-KIT/logos/` | Master SVGs (lettering converted to outlines) + `png/` exports. App icon = `leons-app-icon-1024.svg` |
| `LEONS-BRAND-KIT/icons/` | 36 line icons (24px, 2px stroke, `currentColor`) + `leons-icons-sprite.svg` |
| `LEONS-BRAND-KIT/brand-book/` | 9-page PDF + page images |
| `ux/leons-user-journey.html` | User journeys, workflow table, decisions and open items |
| `design-reference/ClubAppPhotos.html` | **Main screen reference:** Home, My Dogs, Book a Stay, Photos & Updates, Care Notes |
| `design-reference/ClubApp.html` | Earlier screens: Home, Member Card, Book a Stay |
| `design-reference/ClubPasses.html` + `guest-passes-preview.png` + `guest-passes-export.zip` | Credentials: lanyard badge front and back, day pass, founding member card, suite door card, collar band |
| `design-reference/ClubKit.html`, `ClubPatterns.html` | Brand kit and pattern boards |
| `photos/luna-guest-PLACEHOLDER.webp` | The only real photo so far. It's a sample, not final. |

The `design-reference/*.html` files are design-canvas source. Read them for layout, sizes, spacing and copy. Don't ship them as they are.

## Build rules
- **Page background: white (`#FFFFFF`). Cards: near-white (`#FAF8F4`)** with a 2px Ink border. Ink panels are for "dark moments" (status, member card, report header).
- **Square corners (0px)** everywhere except the app icon.
- **Name: "Leon"**. The host is Leon, not "Leo."
- **Photos:** where no real photo exists, show a dark placeholder panel (`#4A4540`, Bone italic text) that *describes the shot*, for example `[Photo: three dogs mid-run across the play yard, shot low at dog height]`. Never use stock images without asking, and never make up dog names, prices, times or phone numbers. Keep `[BRACKETS]` for unknown data.
- **Icons:** only from `icons/`. No emoji, no paw prints, and don't fill icons.
- **Fonts:** Anton (headlines, uppercase), Newsreader (body; italic for sub lines), IBM Plex Mono (labels). All from Google Fonts.

## Screens to build (from the user journey)
**Pet owner:** Onboarding · Home · My Dogs (multiple dogs) · Dog profile + care instructions · Book a service (walk / Day Club / Hotel Stay) · Booking request · Prepare for care (bag checklist) · Photos & Updates · Messages · History · Member card · Account & payments

**Leon / Care desk:** Today · Booking requests (approve/decline) · Visit schedule (walks, arrivals, pickups, overnights) · Dog card with Start Walk / End Walk (no GPS) · Care checklist (meals, walks, meds, photos, concerns) · Messages + private notes · Complete visit · Business settings

**Credentials (in-app and printable):** Member card (with QR spot) · Day pass · Overnight lanyard badge · Suite door card. Layouts are in `ClubPasses.html`.

## Still open (don't decide these on your own)
Waivers and compliance · pricing and cancellation rules · detailed overnight stay workflow · Stripe payments and push notifications (planned).
