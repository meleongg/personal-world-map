import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import {
  resetRedisClientsForTesting,
  setRedisClientsForTesting,
} from "@/app/lib/redis";
import {
  createShare,
  getPublicShare,
  type StoredShare,
} from "@/app/lib/shareStore";

const payload = {
  name: "A map",
  data: {
    countries: { "124": { countryCode: "124", status: "visited" as const } },
    cities: {},
  },
};

const future = new Date(Date.now() + 60_000).toISOString();

class FakeRedis {
  readonly records = new Map<string, unknown>();
  readonly writes: Array<{ key: string; options?: unknown }> = [];

  async get<T>(key: string): Promise<T | null> {
    return (this.records.get(key) as T | undefined) ?? null;
  }

  async set(key: string, value: unknown, options?: unknown): Promise<"OK"> {
    this.writes.push({ key, options });
    this.records.set(key, value);
    return "OK";
  }

  async incr(): Promise<number> {
    return 1;
  }

  async expire(): Promise<number> {
    return 1;
  }
}

afterEach(() => resetRedisClientsForTesting());

test("new share writes use the stamped namespace", async () => {
  const redis = new FakeRedis();
  setRedisClientsForTesting({ read: redis as never, write: redis as never });

  await createShare(payload, "https://stamped.example");

  assert.equal(redis.writes.length, 1);
  assert.match(redis.writes[0].key, /^stamped:share:[0-9A-Za-z]{7}$/);
  assert.deepEqual(redis.writes[0].options, {
    nx: true,
    ex: 90 * 24 * 60 * 60,
  });
});

test("legacy shares remain readable when the namespaced key is absent", async () => {
  const redis = new FakeRedis();
  const id = "AbCd123";
  const legacy: StoredShare = {
    ...payload,
    editToken: "secret",
    createdAt: new Date().toISOString(),
    expiresAt: future,
  };
  redis.records.set(`share:${id}`, legacy);
  setRedisClientsForTesting({ read: redis as never, write: redis as never });

  const share = await getPublicShare(id);

  assert.equal(share?.id, id);
  assert.equal(share?.name, payload.name);
});
