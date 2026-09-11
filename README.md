# TheFernbasketWebsite

The public website for **The Fern Basket** — and the home of its privacy policy.

Static HTML/CSS, no build step. Serve it locally with:

```bash
cd public && python3 -m http.server 8000
```

## Files

Everything that gets published lives in `public/`. Nothing else does.

| Path | What it is |
| --- | --- |
| `public/index.html` | The whole marketing page |
| `public/styles.css` | Design tokens + layout |
| `public/assets/logo-mark.png` | The app's logo mark, copied from the app repo |
| `public/assets/favicon.png` | The app's favicon, copied from the app repo |
| `wrangler.jsonc` | Cloudflare Workers deployment config (not published) |

## Deployment

Deployed to Cloudflare **Workers** (not Pages) as a static-assets Worker named
`thefernbasketwebsite` — it must keep that name, or a deploy creates a second
Worker instead of updating the site. There is no `main` in `wrangler.jsonc`, so
no Worker script runs: Cloudflare serves `public/` directly and returns a plain
404 for anything that doesn't match a file.

**Keep non-site files out of `public/`.** Workers uploads the entire assets
directory and, unlike Pages, does not skip `.git` — so the directory is the
security boundary. That is the whole reason the site sits in `public/` rather
than at the repo root: a directory holding only the site cannot publish the git
history, this config, or a stray notes file by accident.

Builds run from `main`. Validate a config change without deploying:

```bash
npx wrangler@latest deploy --dry-run
```

It reports the assets directory it read and errors on an invalid config. The
file count it prints includes directories, so the four site files read as five.

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

**Footer links** — Terms and Support still carry `is-placeholder-link`; give
each a real `href` and drop that class once those pages exist. Privacy policy
and the contact email are done.

**Legal entity and contact email** — done. The footer, and the privacy
policy at `public/PrivacyPolicy/index.html`, both name Hyosun Kim trading as
"The Fern Basket", 4B Halberg Street, Auckland 0629, New Zealand, and
`support@thefernbasket.com`.

**The privacy policy page itself** — done. `public/PrivacyPolicy/index.html`
publishes the app's `PRIVACY_POLICY.md` (from `ecocraftnz/basket-trans-tasman`)
with its placeholders filled in. Two things from that source doc were
resolved as part of publishing it, and should stay in sync if the app repo's
copy is ever updated to match:
- Children's minimum age: stated as 13 (the draft offered "16 / the age of
  digital consent where you are").
- Dormant/never-verified account retention: stated as not yet enforced,
  since that deletion job is switched off in the code.

The EU representative paragraph was dropped (the draft said to delete it if
not applicable — the app isn't offered to EU/EEA users specifically).

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
