import { describe, expect, it } from "vitest";

import {
  cycleCountryStatus,
  mergeTravelMapData,
  normalizeStoredData,
  updateCityEntry,
} from "@/app/utils/storage";
import { EMPTY_TRAVEL_MAP } from "@/app/types";

describe("local map business logic", () => {
  it("recovers safely from malformed persisted data", () => {
    expect(normalizeStoredData(null)).toEqual(EMPTY_TRAVEL_MAP);
    expect(normalizeStoredData([])).toEqual(EMPTY_TRAVEL_MAP);
    expect(
      normalizeStoredData({ countries: { "124": { status: "visited" } } }),
    ).toEqual({ countries: { "124": { status: "visited" } }, cities: {} });
  });

  it("cycles a country through the defined status order without mutation", () => {
    const original = {
      "124": { countryCode: "124", status: "visited" as const },
    };
    const next = cycleCountryStatus(original, "124");

    expect(next["124"].status).toBe("planning");
    expect(original["124"].status).toBe("visited");
  });

  it("clears a city visit date when its status stops being visited", () => {
    const data = {
      countries: {},
      cities: {
        yvr: {
          cityId: "yvr",
          countryCode: "124",
          name: "Vancouver",
          lat: 49.2,
          lng: -123.1,
          status: "visited" as const,
          visitedAt: "2024-01-01",
        },
      },
    };

    expect(
      updateCityEntry(data, "yvr", { status: "planning" }).cities.yvr,
    ).toMatchObject({ status: "planning", visitedAt: undefined });
  });

  it("merges maps according to the selected conflict strategy", () => {
    const mine = {
      countries: { "124": { countryCode: "124", status: "visited" as const } },
      cities: {},
    };
    const theirs = {
      countries: { "124": { countryCode: "124", status: "avoid" as const } },
      cities: {},
    };

    expect(mergeTravelMapData(mine, theirs).countries["124"].status).toBe(
      "visited",
    );
    expect(
      mergeTravelMapData(mine, theirs, "use-theirs").countries["124"].status,
    ).toBe("avoid");
  });
});
