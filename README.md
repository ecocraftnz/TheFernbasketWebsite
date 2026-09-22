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
| `public/index.html` | The whole marketing page, self-contained (its own `<style>`) |
| `public/PrivacyPolicy/index.html` | The published privacy policy |
| `public/styles.css` | Design tokens + layout. Only the privacy page links it |
| `public/robots.txt` | Allows everything. Pure ASCII on purpose - see below |
| `public/sitemap.xml` | Both pages, with `lastmod` taken from git |
| `public/assets/screens/*.webp` | App screenshots for the "screen by screen" section |
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
file count it prints counts directories too, so it reads higher than the number
of site files - that is expected, not a sign that something stray got included.

## Edge configuration lives in the Cloudflare dashboard

Some of what visitors and crawlers actually receive is set at the edge, not in
this repo, so it will never show up in a diff. Check the dashboard before
concluding the site is misbehaving.

**Bot Preference Sync** (AI Crawl Control -> Settings) is **on**. It prepends
`public/robots.txt` with the crawler preferences configured in **AI Crawl
Control -> Crawlers**, so the served file can carry `Disallow` rules that are
not in this repo. If Google is on that block list, `Google-Extended` is
disallowed and tools that check AI-use permissions report
`URL_FETCH_STATUS_GOOGLE_EXTENDED_OPT_OUT`.

That status is **not** a Search problem. `Google-Extended` governs whether
content may be used for Gemini training and grounding; `Googlebot` governs
Search crawling and indexing, and the two are independent. Leaving the sync on
costs nothing in ranking.

The Crawlers tab is the source of truth; `robots.txt` as served is its output.
To read the real file, bypass the caches:

```bash
curl -sS 'https://thefernbasket.com/robots.txt?v=1'
```

Also set at the edge: the `www` -> apex 301 (Rules -> Redirect Rules). Nothing
in `wrangler.jsonc` does that redirect.

**Keep `public/robots.txt` pure ASCII.** The file is served without
`charset=utf-8`, so non-ASCII bytes render as mojibake - an em dash in the
first comment line showed up live as `a€"`. Use `-`, not `—`.

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

**App store links** — the two badges in the hero. They are real, working links
that currently point at `#faq`, the FAQ entry explaining when the app ships; an
`href="#"` is a dead end for a visitor and an empty link to a crawler. For each
one:

1. Replace `href="#faq"` with the real listing URL.
2. Change `class="badge badge-primary is-placeholder"` to `class="badge
   badge-primary"` (and the same for `badge-ghost`).

Then change the "Coming soon to" kicker in each badge, and the FAQ answer to
"When is it coming to the App Store and Google Play?", which says it is not
published yet. Switch both badges on together, so the page never offers a link
in one place and not the other.

The identifiers for building those URLs, from the app's `app.json`:

| Platform | Identifier |
| --- | --- |
| iOS bundle id | `nz.co.ecocraft.baskettranstasman` |
| Android package | `nz.co.ecocraft.baskettranstasman` |

**Footer links** — Terms and Support still carry `is-placeholder-link`; give
each a real `href` and drop that class once those pages exist. Privacy policy
and the contact email are done.

**Legal entity and contact email** — the published policy deliberately does
NOT carry the operator's personal name or street address. It is a residential
address, the app has not launched, and the page is indexed by Google. The
policy identifies the operator as "The Fern Basket", a sole trader in New
Zealand, gives `support@thefernbasket.com`, and says the full registered name
and postal address are available on request. Replace that with a non-
residential postal address (PO Box or registered office) before launch, then
restore a full identity block.

**The privacy policy page itself** — done. `public/PrivacyPolicy/index.html`
publishes the app's `PRIVACY_POLICY.md` (from `ecocraftnz/basket-trans-tasman`)
with its placeholders filled in. Two things from that source doc were
resolved as part of publishing it, and should stay in sync if the app repo's
copy is ever updated to match:
- Children's minimum age: stated as **16**. The draft offered "16 / the age of
  digital consent where you are"; the app repo's `PRIVACY_POLICY.md` now says 16
  too, so the two are in sync.
- Dormant/never-verified account retention: stated as not yet enforced,
  since that deletion job is switched off in the code.

The EU representative paragraph was dropped (the draft said to delete it if
not applicable — the app isn't offered to EU/EEA users specifically).

## App screenshots

The "From recipe to shopping list, screen by screen" section uses four WebP
files in `public/assets/screens/`, all 665x1440:

| File | Screen |
| --- | --- |
| `capture.webp` | Home, showing the four ways to add a recipe |
| `recipe.webp` | A recipe open, with the ingredient list read from it |
| `basket.webp` | The basket, grouped by supermarket section |
| `price-check.webp` | The store comparison |

665x1440 is a ratio of 2.165, and the CSS frame is `aspect-ratio:9/19.5`
(2.167), so nothing is cropped. A replacement close to any modern phone screen
will also fit; `object-fit:cover` absorbs the difference. The same four
filenames are listed as `screenshot` on the `MobileApplication` node in the
page's JSON-LD, which is one of the things Google wants before it will show an
app rich result.

**Check what an export actually is before committing it.** The first upload of
these four arrived named `.png` but was WebP underneath (`RIFF....WEBPVP8L`),
which would have been served as `image/png` with WebP bytes. `file *.png` or
the first eight bytes will tell you.

**Serve them with a plain `<img>`, no `<picture>`.** There is no PNG fallback
and none is wanted: every browser this site targets decodes WebP, and a
`<picture>` whose `<source>` 404s shows nothing at all rather than falling back
to the `<img>`, because it switches on *format support* and not on whether the
file exists. Verified in Chromium.

**The screens show example data, not a real shop**, and the section says so in
its opening paragraph. Keep that line if the images are ever replaced, and keep
the app's rule that prices are estimates: the captions describe the comparison
without quoting a figure from the screenshots.

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
