import { afterEach, describe, expect, it, vi } from "vitest";

const redis = vi.hoisted(() => ({
  getReadRedis: vi.fn(),
  getWriteRedis: vi.fn(),
}));

vi.mock("@/app/lib/redis", () => redis);

import {
  checkCreateRateLimit,
  createShare,
  getPublicShare,
  SHARE_TTL_SECONDS,
  ShareStoreError,
  updateShare,
} from "@/app/lib/shareStore";

const payload = {
  name: "A map",
  data: {
    countries: { "124": { countryCode: "124", status: "visited" as const } },
    cities: {},
  },
};

const future = new Date(Date.now() + 60_000).toISOString();

afterEach(() => vi.clearAllMocks());

describe("share store", () => {
  it("writes a new share with a 90-day TTL and returns a public URL", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    redis.getWriteRedis.mockReturnValue({ set });

    const result = await createShare(payload, "https://stamped.example/");

    expect(set).toHaveBeenCalledWith(
      expect.stringMatching(/^share:[0-9A-Za-z]{7}$/),
      expect.objectContaining({ name: "A map", editToken: expect.any(String) }),
      { nx: true, ex: SHARE_TTL_SECONDS },
    );
    expect(result.url).toBe(`https://stamped.example/m/${result.id}`);
  });

  it("returns only the public subset of a stored share", async () => {
    redis.getReadRedis.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        ...payload,
        data: {
          countries: {
            "124": {
              countryCode: "124",
              status: "visited",
              notes: "private",
            },
          },
          cities: {},
        },
        editToken: "secret",
        createdAt: "2024-01-01T00:00:00.000Z",
        expiresAt: future,
      }),
    });

    await expect(getPublicShare("AbCd123")).resolves.toEqual({
      id: "AbCd123",
      name: "A map",
      data: {
        countries: { "124": { countryCode: "124", status: "visited" } },
        cities: {},
      },
      createdAt: "2024-01-01T00:00:00.000Z",
      expiresAt: future,
    });
  });

  it("enforces the create rate limit after the allowed threshold", async () => {
    const expire = vi.fn().mockResolvedValue(1);
    redis.getWriteRedis.mockReturnValue({
      incr: vi.fn().mockResolvedValue(11),
      expire,
    });

    await expect(checkCreateRateLimit("203.0.113.1")).rejects.toMatchObject({
      code: "rate_limited",
    } satisfies Partial<ShareStoreError>);
    expect(expire).not.toHaveBeenCalled();
  });

  it("starts the create rate-limit window on the first request", async () => {
    const expire = vi.fn().mockResolvedValue(1);
    redis.getWriteRedis.mockReturnValue({
      incr: vi.fn().mockResolvedValue(1),
      expire,
    });

    await expect(checkCreateRateLimit("203.0.113.1")).resolves.toBeUndefined();
    expect(expire).toHaveBeenCalledWith(
      "ratelimit:share:create:203.0.113.1",
      60 * 60,
    );
  });

  it("rejects unauthorized updates without writing", async () => {
    const set = vi.fn();
    redis.getWriteRedis.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        ...payload,
        editToken: "correct-token",
        createdAt: "2024-01-01T00:00:00.000Z",
        expiresAt: future,
      }),
      set,
    });

    await expect(
      updateShare("AbCd123", "wrong-token", payload, "https://stamped.example"),
    ).rejects.toMatchObject({ code: "unauthorized" });
    expect(set).not.toHaveBeenCalled();
  });
});
