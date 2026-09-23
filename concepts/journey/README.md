# The Fern Basket: journey page (draft)

A one-page, scroll-driven site that shows how the app works: one recipe
travels through four stages, and the visitor can play with each one.

**Not deployed.** Cloudflare only publishes `public/`, so nothing in
`concepts/` is served. To make it the live homepage, copy `index.html` over
`public/index.html` once the items under "Before it goes live" are done.

Open `index.html` in a browser to try it. One file, inline CSS and
JavaScript, no build step. The only outside request is Google Fonts.

## Editing

Everything you are likely to change is in `CONFIG` at the top of the script:
the CTA label and link, all page copy, the words inside the phone, both demo
recipes, the Premium swap suggestions, the aisles, and the placeholder store
names and prices. Colours are the tokens at the top of the `<style>` block,
copied from the app's `src/theme/tokens.ts`.

The page copy lives in two places on purpose: in `CONFIG`, and as plain text
in the HTML so the page still reads with JavaScript off. After editing copy in
`CONFIG`, run

```bash
node concepts/journey/tools/sync-copy.mjs
```

to write it into the HTML. If you forget, the page still shows `CONFIG`'s text
(JavaScript wins), and the browser console names each key that differs.

## Before it goes live

- **The CTA link is unverified.** `CONFIG.cta.href` is the usual Play testing
  URL pattern for the app's package id. Paste the real opt-in link from Play
  Console (Testing, Closed testing, Testers).
- **A closed test only admits listed testers.** Someone who taps "Make it your
  own" without being on the tester list, or in a Google Group that is, will be
  turned away by Google Play. For a public page, either join testers through an
  open Google Group or move to open testing.
- **Prices and stores are placeholders**, and say so on screen. Replace them
  in `CONFIG.stores` and `CONFIG.prices`.
- **"Still rough" is only what could be checked in the code on 23 Sep 2026.**
  Add what you know from testing.

## The no-JavaScript fallback

Each section carries a `<noscript>` image of that stage's end state, embedded
as a WebP data URI (about 25 KB each). They are snapshots of the demo as it
was built. If the demo recipe or the phone copy changes, re-take them.

## What the page claims, and where each claim was checked

| Claim | Checked in the app repo |
| --- | --- |
| Share a recipe from the browser | `app.json` (`expo-share-intent`), `src/hooks/useSharedRecipe.ts` |
| Photo of a handwritten card | `server/src/services/ai.ts` parse prompt |
| Serves rescale every amount | `src/app/recipe/[id].tsx`, `scaleQty` |
| Take an item out | `src/app/(tabs)/basket.tsx`, remove with Undo |
| Swaps are Premium | `server/README.md` (402 unless premium), `src/app/paywall.tsx` |
| Store estimates are free | no entitlement check in `src/app/compare.tsx` |
| Capture tile wording on the home screen | `src/components/CaptureTiles.tsx` |
| Premium: Improve (healthier, lower calories) | `src/app/improve/index.tsx`; gated in `src/app/improve/results.tsx` |
| Premium: Adapt (vegetarian, vegan, gluten-free; changes the steps; household default) | `src/app/adapt/index.tsx`; gated in `src/app/adapt/results.tsx` |
| Premium: original kept, saved versions, undo any swap | the Improve/Adapt screens' own copy; `src/app/paywall.tsx` |
| Premium: monthly or annual, "Cancel anytime in Settings" | `src/app/paywall.tsx` |
| Premium: 7-day free trial | paywall copy, and confirmed by the owner as set in Play Console |
| Home screen Premium card wording | `src/components/UpgradeBar.tsx` |

**Deliberately not claimed:** "Unlimited recipes". The paywall lists it as a
Premium benefit, but free users have no recipe limit in the code, so on this
page it would describe a restriction that does not exist. **No subscription
price is quoted**: prices come from Google Play at runtime and none are in the
code.
