# Product and engineering steering

This file records decisions that are intentionally not inferred from code. It
guides implementation choices; [`AGENTS.md`](AGENTS.md) defines the required
development workflow.

## User data and privacy

- A person's complete travel map, city details, notes, visit dates, theme, and
  share-edit token are local-first browser data. Do not send them elsewhere
  unless a future, explicitly approved product decision changes that boundary.
- A public share is a deliberately reduced snapshot: map name plus country and
  city statuses. Notes and visit dates must never enter the share payload.
- Share links are anonymous, read-only to visitors, and expire after 90 days of
  inactivity. Preserve existing link compatibility when changing share formats.

## Storage and external services

- Stamped uses its own Upstash Redis database and credentials for share
  snapshots. Do not introduce shared cross-project Redis storage without an
  explicit security and operational decision.
- Use a write token only in create/update paths. Prefer the read-only token for
  shared-map pages and OG images.
- Never inspect, flush, delete, or migrate production Redis data without an
  approved, reviewed plan. Migrations require a dry run and rollback/compatibility
  story.

## Data contracts

- Country codes are zero-padded ISO numeric strings. Preserve that representation
  across storage, map data, city data, shares, and comparisons.
- Generated geography under `public/` is product data, not a disposable cache.
  Regenerate city data only through `npm run build:cities` and commit the output
  with any relevant source-data changes.
- Business logic belongs in `app/utils/` or `app/lib/`; UI components should
  orchestrate it rather than duplicate policies or transformations.

## Testing decisions

- Tests must be deterministic and must not use live Redis, Vercel, browser
  storage, or network services.
- Cover privacy boundaries, payload validation/canonicalization, local data
  transformations, comparison behavior, statistics, and share-store error paths.
- Favor table-driven unit tests for new policy rules. Add component tests only
  when UI state cannot be adequately protected by business-logic tests.

## Change decisions

- Keep backward compatibility for existing browser data and share links unless a
  separately approved migration explicitly says otherwise.
- Treat changes to retention, what gets shared, status semantics, country-code
  representation, or external-storage topology as product/security decisions;
  surface them clearly in the PR before implementation.
