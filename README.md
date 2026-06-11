# Pax Listing Optimizer

An internal tool for Pax Distribution that generates Amazon-compliant
listing copy (title, 5 bullets, description) using the Claude API, and
validates the result against an Amazon compliance checklist.

## What it is

- Single-page React app (Vite).
- Account-level settings (brand name, brand voice, region, additional
  rules) are saved to `localStorage` so they persist across sessions
  and products.
- Product info is entered per listing and is **not** persisted -
  clear and replace it for each new product.
- Generation calls the Claude Messages API directly from the browser.
- Every generated listing is run through a pure-JS compliance
  validator, with results shown as pass/fail checks.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL, expand **API Settings**, and paste in a
Claude API key (starts with `sk-ant-...`). The key is stored in your
browser's `localStorage` only.

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # preview the production build locally
npm run lint     # eslint
```

## Deploying to Vercel

This is a static Vite build, so it deploys to Vercel with no extra
configuration:

1. Push the project to a Git repo and import it in Vercel, **or** run
   `vercel` / `vercel --prod` from this directory with the
   [Vercel CLI](https://vercel.com/docs/cli).
2. Framework preset: **Vite** (build command `npm run build`, output
   directory `dist`).
3. No environment variables are required - each user supplies their
   own Claude API key in the UI, stored client-side.

### About the API key

The app currently calls `https://api.anthropic.com/v1/messages`
directly from the browser using
`anthropic-dangerous-direct-browser-access: true`, with the API key
held in `localStorage`. This is convenient for an internal tool but
means the key is visible to anyone with access to that browser.

For a production deployment, move the API call into a Vercel
serverless function (e.g. `api/generate.js`) that holds the key as a
server-side environment variable, and have the frontend call that
endpoint instead of Anthropic directly. The settings bar already notes
this tradeoff to users.

## Where things live

- `src/systemPrompt.js` - builds the system prompt sent to Claude.
  Account settings (brand name, brand voice, region, additional rules)
  are injected into the prompt as template variables, along with the
  Amazon compliance rules the model is asked to follow.
- `src/api.js` - calls the Claude Messages API
  (`model: claude-sonnet-4-6`), strips ` ```json ` code fences from the
  response, parses the JSON, and turns API/parse failures into
  friendly error messages (with the raw response shown for debugging).
- `src/validator.js` - the compliance validator (see below).
- `src/components/` - `SettingsPanel`, `AccountSettings`,
  `ProductForm`, `OutputCard`, `ValidationPanel`.
- `src/hooks/useLocalStorage.js` - small hook backing the persisted
  API key and account settings.

## What the validator checks

`src/validator.js` runs entirely client-side after every generation.
All phrase matching is case-insensitive and uses word-boundary (`\b`)
regexes, so e.g. "bestseller" does not trip the "best" rule.

**Title**

- ERROR if over 200 characters (Amazon suppression risk).
- WARN if over 160 characters (above the recommended range).
- ERROR if it contains any of `! $ ? _ { } ^ ¬ ¦`.
- ERROR if the brand name appears more than twice.
- WARN if any non-stopword appears more than twice (keyword stuffing).

**Title, every bullet, and the description**

- ERROR on medical/therapeutic claims: "treats", "cures", "prevents",
  "heals", "doctor recommended", "FDA approved", "therapeutic",
  "antibacterial".
- ERROR on pricing/shipping language: "cheapest", "free shipping",
  "lowest price", "best deal", "discount", "on sale", "save money".
- ERROR on unverifiable superlatives: "#1", "number one", "best in the
  world", "world's best", "top rated", "industry leading", "best".
- ERROR on competitor brand names. Seeded with common auto-body tool
  brands; add more by writing a line such as
  `Competitors: Brand A, Brand B` in Account Settings -> Additional
  rules.

**Bullets**

- ERROR if there aren't exactly 5 bullets.
- ERROR per bullet over 250 characters.
- WARN on exclamation points or emoji.
- WARN if a run of ALL CAPS words longer than 5 words appears (a
  leading "LABEL:"-style opener, or just the first word, is exempted).

**Description**

- WARN if more than 3 paragraphs.
- WARN if under 40 words (too thin).

Each check returns `{ field, severity, rule, match }`, and the
`ValidationPanel` groups them by category with pass/fail icons,
showing severity, the rule, and the exact offending text for any
failures.
