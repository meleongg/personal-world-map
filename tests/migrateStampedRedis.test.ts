import assert from "node:assert/strict";
import test from "node:test";

import { migrateLegacyStampedKeys } from "../scripts/migrate-stamped-redis.mjs";

class FakeRedis {
  readonly values = new Map<string, { value: string; ttl: number }>();
  readonly scans: string[] = [];

  constructor(entries: Array<[string, string, number]>) {
    for (const [key, value, ttl] of entries) {
      this.values.set(key, { value, ttl });
    }
  }

  async scan(cursor: string, options: { match: string }) {
    this.scans.push(options.match);
    if (cursor !== "0") return ["0", []] as const;
    const prefix = options.match.slice(0, -1);
    return [
      "0",
      [...this.values.keys()].filter((key) => key.startsWith(prefix)),
    ] as const;
  }

  async exists(key: string) {
    return this.values.has(key) ? 1 : 0;
  }

  async renamenx(source: string, destination: string) {
    if (this.values.has(destination)) return 0;
    const record = this.values.get(source);
    if (!record) return 0;
    this.values.delete(source);
    this.values.set(destination, record);
    return 1;
  }

  ttl(key: string) {
    return this.values.get(key)?.ttl;
  }
}

const quiet = () => undefined;

test("migration is idempotent, preserves TTLs, and leaves unrelated keys untouched", async () => {
  const redis = new FakeRedis([
    ["share:AbCd123", "share", 7_776_000],
    ["ratelimit:share:create:203.0.113.1", "rate", 3_600],
    ["canopy:ratelimit:ai:203.0.113.2", "canopy", 600],
    ["other:share:AbCd123", "other", 600],
  ]);

  const first = await migrateLegacyStampedKeys(redis, {
    dryRun: false,
    log: quiet,
  });
  const second = await migrateLegacyStampedKeys(redis, {
    dryRun: false,
    log: quiet,
  });

  assert.deepEqual(first, {
    scanned: 2,
    migrated: 2,
    skipped: 0,
    collisions: 0,
    wouldMigrate: 0,
  });
  assert.deepEqual(second, {
    scanned: 0,
    migrated: 0,
    skipped: 0,
    collisions: 0,
    wouldMigrate: 0,
  });
  assert.equal(redis.ttl("stamped:share:AbCd123"), 7_776_000);
  assert.equal(redis.ttl("stamped:ratelimit:share:create:203.0.113.1"), 3_600);
  assert.equal(
    redis.values.get("canopy:ratelimit:ai:203.0.113.2")?.value,
    "canopy",
  );
  assert.equal(redis.values.get("other:share:AbCd123")?.value, "other");
  assert.deepEqual(redis.scans.slice(0, 2), [
    "share:*",
    "ratelimit:share:create:*",
  ]);
});

test("dry runs do not mutate and collisions leave legacy keys in place", async () => {
  const redis = new FakeRedis([
    ["share:AbCd123", "legacy", 7_776_000],
    ["stamped:share:AbCd123", "namespaced", 7_700_000],
  ]);

  const dryRun = await migrateLegacyStampedKeys(redis, {
    dryRun: true,
    log: quiet,
  });
  const executed = await migrateLegacyStampedKeys(redis, {
    dryRun: false,
    log: quiet,
  });

  assert.deepEqual(dryRun, {
    scanned: 1,
    migrated: 0,
    skipped: 0,
    collisions: 1,
    wouldMigrate: 0,
  });
  assert.deepEqual(executed, {
    scanned: 1,
    migrated: 0,
    skipped: 0,
    collisions: 1,
    wouldMigrate: 0,
  });
  assert.equal(redis.values.get("share:AbCd123")?.value, "legacy");
  assert.equal(redis.values.get("stamped:share:AbCd123")?.value, "namespaced");
});
