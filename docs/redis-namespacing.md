# Redis namespacing rollout

Stamped shares now use `stamped:share:<id>` and creation rate limits use
`stamped:ratelimit:share:create:<ip>`. The application reads the namespaced
share first and falls back to `share:<id>` for existing public links. New share
writes and updates use only the namespaced key.

## Rollout procedure

1. Deploy the compatibility code before migrating any data.
2. Run `node scripts/migrate-stamped-redis.mjs --dry-run` with the write-token
   environment variables configured. It uses only `SCAN` and `EXISTS` and makes
   no Redis changes.
3. Review its scanned, would-migrate, skipped, and collision counts. Resolve any
   unexpected collisions before continuing.
4. With explicit approval, run `node scripts/migrate-stamped-redis.mjs --execute`.
   It scans only `share:*` and `ratelimit:share:create:*`, then uses `RENAMENX`
   to atomically move a key only when its `stamped:` destination is absent.
   `RENAMENX` preserves the key's existing TTL.
5. Verify several existing `/m/<id>` URLs, including links created before the
   deployment.
6. Retain the legacy share-read fallback for at least the maximum 90-day share
   TTL. Remove it only in a separate cleanup PR after that period.

The script defaults to dry-run mode. It never uses `KEYS`, flushes nothing, and
does not delete keys outside Stamped's two exact legacy prefixes.
