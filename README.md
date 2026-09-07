# Stamped

Stamped is a local-first travel map: people track countries and cities in their
browser, optionally create anonymous read-only share links, and compare maps
without creating an account.

## Architecture at a glance

- **Client state:** React state persists full maps, notes, dates, theme, and the
  share edit token in `localStorage`; private map details never leave the browser
- **Sharing boundary:** Next.js route handlers canonicalize and validate a reduced
  payload before storing it in Upstash Redis; notes and visit dates are excluded
- **Share lifecycle:** 7-character collision-resistant IDs, edit-token ownership,
  per-IP create limits, and a rolling 90-day Redis TTL protect anonymous links
- **Map data:** Country boundaries and the city catalog are bundled static data,
  so map rendering and search do not depend on a runtime third-party API
- **Read path:** Shared pages and Open Graph images use the read-only Redis token
  when configured; create and update paths require the write token

## Stack

Next.js 15 App Router, React 19, TypeScript, D3/TopoJSON, Upstash Redis, and
Tailwind CSS. The application is intended for Vercel deployment.

## Local development

```bash
npm install
cp .env.example .env.development.local
npm run dev
```

Sharing requires an Upstash Redis REST URL and write token. A read-only token is
recommended for rendering shared maps and OG images. See [`.env.example`](.env.example).

## Verification

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

The unit suite is network-free and covers share payload privacy, validation,
storage transformations, comparisons, statistics, and Redis store error paths.

## Data and operational notes

- Country codes are zero-padded ISO numeric strings throughout storage, shares,
  comparisons, and bundled geographic data
- `public/world-atlas/` and `public/cities/` are versioned product data, not a
  runtime cache; update city data only with `npm run build:cities`
- Preserve existing `localStorage` and share-link compatibility when changing
  data contracts; share links expire after 90 days of inactivity
- Do not inspect, flush, or migrate production Redis without an approved plan

## Repository layout

```text
app/api/share/       Create, update, and read share-link handlers
app/lib/             Redis clients and share persistence
app/utils/           Pure state, payload, comparison, and geographic logic
app/hooks/           Local-first map-state orchestration
app/m/[data]/        Server-rendered shared maps and OG images
public/              Bundled TopoJSON boundaries and generated city catalog
scripts/             Geographic-data generation utilities
tests/               Deterministic unit tests for business logic
```

## Geographic data

Country boundaries and city records derive from [Natural Earth](https://www.naturalearthdata.com/).
The city catalog includes capitals and selected major cities; its generation rules
are documented in [`scripts/build-city-catalog.mjs`](scripts/build-city-catalog.mjs).
