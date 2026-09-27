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
| `public/chrome.css` | The chrome every page shares: tokens, fonts, top bar, logo mark, watermarks, footer, headings. Change these here, never in a page |
| `public/index.html` | The marketing page: links `chrome.css`, then its own `<style>` for the hero animation and content sections |
| `public/PrivacyPolicy/index.html` | The published privacy policy (version `2026-09-27`; the app records consents against that exact string) |
| `public/delete-account/index.html` | How to delete an account, at `/delete-account/`, which the app's policy and Google Play point to |
| `public/styles.css` | What long-form text needs (the policy layout, tables). Only the text pages link it, after `chrome.css` |
| `concepts/cards/template.html` | The source of the six "What the app does" card animations. `tools/build-cards.py` copies the hero's produce drawings and basket into it and writes both the prototype and the homepage's copy |
| `tools/build-cards.py` | Rebuilds the card animations after a change to the template: `python3 tools/build-cards.py`, then commit both outputs. Never edit the generated blocks in `index.html` by hand |
| `tools/check-chrome.mjs` | Fails if any page's top bar, watermarks, logo mark, footer or stylesheet links differ from the others. Run before every PR |
| `public/robots.txt` | Allows everything. Pure ASCII on purpose - see below |
| `public/sitemap.xml` | All three pages, with `lastmod` taken from git |
| `public/assets/walkthrough/*.png` | The eight walkthrough screenshots on the homepage, 600x1298, red outlines marking the tap |
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

The typefaces are Fraunces (display: the headline, section headings and the
recipe cards) and Plus Jakarta Sans (everything else, weights 400 to 800, the
same as the app), loaded from Google Fonts.

## One chrome for every page

Every page must look like the same site: the same top bar and theme toggle,
the logo mark with its rings above the title, the same watermarks behind the
page, the same footer, the same fonts, colours and heading sizes. That chrome
lives in `public/chrome.css`, and the markup for it is copied verbatim into
each page (`index.html`, `PrivacyPolicy/`, `delete-account/`).

Rules:

1. A change to any of those things is made in `chrome.css`, once. If it needs
   markup, change it in every page in the same commit.
2. A new page starts by copying `public/delete-account/index.html` and
   replacing the content between `<div class="page-head">…</div>` and
   `</section>`. Nothing else in the skeleton changes.
3. Run `node tools/check-chrome.mjs` before opening a PR. It compares the top
   bar, watermarks, logo mark, footer and stylesheet links across all pages
   and fails on the first difference.

## Placeholders still to fill

Everything below is deliberately inert and marked in the source with a
`PLACEHOLDER` comment.

**The Get-the-app buttons** — the hero's "Coming soon" label is not a link,
and the two store badges under it are real, working links that point at
`#faq`, the FAQ entry explaining when the app ships; an `href="#"` is a dead
end for a visitor and an empty link to a crawler. All three are marked
`PLACEHOLDER` in the source. When a listing exists:

1. Point that badge's `href` at the listing URL and drop `is-placeholder`.
2. Change its kicker from "Coming to" to "Get it on".
3. Reword the FAQ answer to "When is it coming to the App Store and Google
   Play?" (in both the markup and the JSON-LD, which mirror each other) and
   the footer note. Both say it is not published yet.

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

## The walkthrough

The homepage section "From a recipe link to a ticked-off shopping list"
(`#how-it-works`) steps through the app in eight screenshots, in
`public/assets/walkthrough/`, all 600x1298 PNG with a red outline marking
where to tap. It auto-plays one step every four seconds while on screen and
stops for good at the first click, tap or arrow key; it never auto-plays under
`prefers-reduced-motion`. The eight filenames are listed as `screenshot` on
the `MobileApplication` node in the page's JSON-LD. The step titles,
descriptions and alt text were supplied verbatim; keep them in step with the
app if a screen changes.

**Check what an export actually is before committing it.** An earlier upload
arrived named `.png` but was WebP underneath (`RIFF....WEBPVP8L`), which
would have been served as `image/png` with WebP bytes. `file *.png` or the
first eight bytes will tell you.

**The screens show an example recipe**, and the section says so under the
walkthrough. Keep that line if the images are ever replaced.

## Keeping copy in step with the app

Some text on the page is quoted from the app rather than written for the web,
so that the two never drift apart:

- The tagline **"Every recipe, one shopping list."** is the app's welcome-screen
  subtitle (`src/app/onboarding.tsx`).
- The store-comparison card borrows the app's own framing from
  `src/components/SavingsCTA.tsx`: "Find the cheapest store", and the caveat
  that shelf prices may differ.

If either changes in the app, change it here too.

The six cards under "What the app does" are written for the web, not quoted:
they describe the same features as the app's `HERO_PERKS` (onboarding) and the
paywall's `BENEFITS`, but in longer, search-friendly headings. An earlier
version of the page used those two lists word for word; this one does not, so
there is nothing to keep verbatim. Keep the *claims* in step instead: if a
feature changes or moves behind Premium, the card describing it must change.

Store names: the app spells it both `PAK'nSAVE` and `Pak'nSave`; this site
uses `Pak'nSave` throughout. Pick one if that ever matters, and change every
occurrence, including the FAQ, whose answers also feed the FAQPage JSON-LD.

One rule the app holds and the site inherits: **prices are estimates.** No NZ
supermarket offers a public price feed, so the site never quotes a grocery
price, and it never quotes a subscription price either — those come from the
App Store or Google Play at runtime, and the app deliberately has no hardcoded
fallback price to copy.
