import { Redis } from "@upstash/redis";

export const LEGACY_STAMPED_KEY_PREFIXES = [
  "share:",
  "ratelimit:share:create:",
];

const targetKey = (legacyKey) => `stamped:${legacyKey}`;

const isLegacyStampedKey = (key) =>
  LEGACY_STAMPED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

const getWriteRedis = () => {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Missing KV_REST_API_URL/UPSTASH_REDIS_REST_URL or write-token environment variable.",
    );
  }
  return new Redis({ url, token });
};

/**
 * Move only Stamped's legacy Redis keys into the shared-database namespace.
 * RENAMENX is atomic and retains a key's existing TTL.
 *
 * @param {{ scan: Function, exists: Function, renamenx: Function }} redis
 * @param {{ dryRun: boolean, log?: (message: string) => void }} options
 */
export const migrateLegacyStampedKeys = async (redis, options) => {
  const { dryRun, log = console.log } = options;
  const report = {
    scanned: 0,
    migrated: 0,
    skipped: 0,
    collisions: 0,
    wouldMigrate: 0,
  };

  for (const prefix of LEGACY_STAMPED_KEY_PREFIXES) {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });
      cursor = nextCursor;

      for (const key of keys) {
        if (!isLegacyStampedKey(key)) {
          report.skipped++;
          continue;
        }

        report.scanned++;
        const destination = targetKey(key);
        if (dryRun) {
          if (await redis.exists(destination)) {
            report.collisions++;
          } else {
            report.wouldMigrate++;
          }
          continue;
        }

        if (await redis.renamenx(key, destination)) {
          report.migrated++;
        } else {
          report.collisions++;
        }
      }
    } while (cursor !== "0");
  }

  log(
    `Stamped Redis migration (${dryRun ? "dry run" : "executed"}): ` +
      `scanned=${report.scanned}, migrated=${report.migrated}, ` +
      `wouldMigrate=${report.wouldMigrate}, skipped=${report.skipped}, ` +
      `collisions=${report.collisions}`,
  );
  return report;
};

const args = new Set(process.argv.slice(2));
const unknownArgs = [...args].filter(
  (argument) => argument !== "--dry-run" && argument !== "--execute",
);

if (
  unknownArgs.length > 0 ||
  (args.has("--dry-run") && args.has("--execute"))
) {
  console.error(
    "Usage: node scripts/migrate-stamped-redis.mjs [--dry-run|--execute]",
  );
  process.exitCode = 1;
} else if (import.meta.url === `file://${process.argv[1]}`) {
  const run = async () => {
    const dryRun = !args.has("--execute");
    if (dryRun) {
      console.log(
        "Dry run only. Pass --execute to perform collision-safe Redis renames.",
      );
    }
    const redis = getWriteRedis();
    await migrateLegacyStampedKeys(redis, { dryRun });
  };
  void run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
