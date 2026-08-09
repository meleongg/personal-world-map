# Repository guidance

## Architecture and conventions

Stamped is a Next.js 15.5 App Router application using React 19, TypeScript 5.9,
Tailwind CSS 4, and shadcn/ui-style primitives. ESLint 9 uses the Next core-web-
vitals and TypeScript configurations, with Prettier handling formatting.

- `app/` contains routes, layouts, API route handlers, feature components, hooks,
  contexts, server helpers, and application types.
- Keep route and UI code in `app/page.tsx`, route folders, and `app/components/`;
  keep business logic out of components. Put pure domain logic in `app/utils/`,
  shared constants in `app/constants/`, and server-only share persistence in
  `app/lib/`.
- User travel maps, notes, and theme live locally in browser `localStorage`.
  Share snapshots are created/read through `app/api/share/` and stored in Upstash
  Redis via `app/lib/shareStore.ts` and `app/lib/redis.ts`.
- Map boundaries and the city catalog are bundled static data under `public/`.
  `scripts/build-city-catalog.mjs` regenerates the city catalog from Natural
  Earth source data.

Preserve the existing App Router, path alias (`@/*`), Tailwind, shadcn/ui, and
local-first conventions. TypeScript is strict (`tsconfig.json` has `strict:
true`); retain strict typing and do not weaken compiler or lint settings to make
a change pass.

Before changing Next.js, React, App Router, route handler, metadata, image, or
other framework-specific code, read the relevant documentation installed with
the project (and the matching official documentation when needed). This is
especially important for this Next.js 15.5 setup, whose behavior may differ from
older Next.js guidance.

Do not add dependencies unless they are genuinely necessary and explicitly
approved.

## Data and external-service safety

Inspect integrations and data flows before changing them. Treat Upstash Redis,
Vercel environments, browser storage, and bundled/generated geographic data as
production-sensitive:

- Never flush, delete, or otherwise destructively modify production data.
- Design migrations with dry-run support; run a dry run first.
- Request explicit approval before any external mutation, including Redis writes,
  Vercel environment/deployment changes, or migration execution.

## Verification

`package.json` provides these relevant commands:

```bash
npm run lint
npm run build
```

There is currently no package test script and no package type-check script. For
TypeScript verification, use the installed compiler:

```bash
npx tsc --noEmit
```

Prefer backend and business-logic tests when adding coverage. Frontend component
tests are optional unless complex UI state makes them worthwhile.

## Git and delivery workflow

Never commit directly to the default branch (`main`). Work on a short-lived
`feat/` or `fix/` branch. Deliver feature work as a validated draft pull request.

Definition of done, in order:

1. Run lint and type-check.
2. Run applicable tests (none are currently configured) and then the production
   build when available.
3. Review the clean diff and explain the changes and verification results.
4. Commit the work on the feature/fix branch, push it, and open a draft PR.
