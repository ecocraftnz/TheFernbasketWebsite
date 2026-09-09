# TheFernbasketWebsite

The public website for **The Fern Basket** — and the home of its privacy policy.

Static HTML/CSS, no build step. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
```

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole marketing page |
| `styles.css` | Design tokens + layout |
| `assets/logo-mark.png` | The app's logo mark, copied from the app repo |
| `assets/favicon.png` | The app's favicon, copied from the app repo |

## Colours come from the app, not from here

Every hex value in `styles.css` is copied verbatim from
`src/theme/tokens.ts` in the app repo (`ecocraftnz/basket-trans-tasman`),
which is itself generated from `design-tokens.json`. Both the light and dark
palettes are mirrored, and the site follows the OS theme because the app's
`userInterfaceStyle` is `automatic`.

**Never invent a colour here.** If the site needs one the app doesn't define,
add it to the app's tokens first, then copy it across. Spacing follows the same
8pt grid, and the type scale mirrors the app's `type` map.

The typeface is Plus Jakarta Sans (weights 500/600/700/800), the same as the
app, loaded from Google Fonts.

## Placeholders still to fill

Everything below is deliberately inert and marked in the source with a
`PLACEHOLDER` comment.

**App store links** — the two badges in the hero and the two in "Get the app".
For each one:

1. Replace `href="#"` with the real listing URL.
2. Change `class="store-badge is-placeholder"` to `class="store-badge"`.
3. Delete the `aria-disabled="true"` attribute.

Then update the `.store-note` line under each pair, which currently says the
app isn't published yet. Switch the hero pair and the "Get the app" pair on
together, so the page never offers a link in one place and not the other.

The identifiers for building those URLs, from the app's `app.json`:

| Platform | Identifier |
| --- | --- |
| iOS bundle id | `nz.co.ecocraft.baskettranstasman` |
| Android package | `nz.co.ecocraft.baskettranstasman` |

**Footer links** — Privacy policy, Terms, Support, and the contact email all
carry `is-placeholder-link`. Give each a real `href` and drop that class.

**Legal entity and contact email** — the footer says `[LEGAL ENTITY NAME]` and
`[CONTACT EMAIL]`. The app's own `PRIVACY_POLICY.md` still carries the same
placeholders, plus `[ADDRESS]`. Fill them in the same pass so the site and the
policy agree.

**The privacy policy page itself** — the Privacy section links nowhere yet.
`PRIVACY_POLICY.md` lives in the app repo; publishing it here is the next job.

## Keeping copy in step with the app

Some text on the page is quoted from the app rather than written for the web,
so that the two never drift apart:

- The tagline **"Every recipe, one shopping list."** is the app's welcome-screen
  subtitle (`src/app/onboarding.tsx`).
- The three perk cards are the app's `HERO_PERKS`, word for word.
- The three Premium cards are the paywall's `BENEFITS` list.

If any of those change in the app, change them here too.

One rule the app holds and the site inherits: **prices are estimates.** No NZ
supermarket offers a public price feed, so the site never quotes a grocery
price, and it never quotes a subscription price either — those come from the
App Store or Google Play at runtime, and the app deliberately has no hardcoded
fallback price to copy.
