import { describe, expect, it } from "vitest";

import { computeCityOverlap } from "@/app/utils/compare";
import { computeStats } from "@/app/utils/stats";

const city = (cityId: string, name: string, countryCode = "124") => ({
  cityId,
  countryCode,
  name,
  lat: 0,
  lng: 0,
  status: "visited" as const,
});

describe("comparison and statistics", () => {
  it("groups city overlap and sorts each group by city name", () => {
    const result = computeCityOverlap(
      { alpha: city("alpha", "Alpha"), zulu: city("zulu", "Zulu") },
      { alpha: city("alpha", "Alpha"), beta: city("beta", "Beta") },
    );

    expect(result.stats).toEqual({ both: 1, onlyMine: 1, onlyTheirs: 1 });
    expect(result.both.map(({ name }) => name)).toEqual(["Alpha"]);
    expect(result.onlyTheirs.map(({ name }) => name)).toEqual(["Beta"]);
    expect(result.onlyMine.map(({ name }) => name)).toEqual(["Zulu"]);
  });

  it("counts valid status entries and derives visit years and continents", () => {
    const stats = computeStats({
      countries: {
        "124": {
          countryCode: "124",
          status: "visited",
          visitedAt: "2019-06-01",
        },
        "250": {
          countryCode: "250",
          status: "visited",
          visitedAt: "2024-05-01",
        },
        invalid: { countryCode: "000", status: "unknown" as never },
      },
      cities: { alpha: city("alpha", "Alpha") },
    });

    expect(stats.byStatus.visited).toBe(2);
    expect(stats.firstVisitYear).toBe(2019);
    expect(stats.latestVisitYear).toBe(2024);
    expect(stats.continentsCovered).toEqual(["Europe", "North America"]);
    expect(stats.citiesMarkedCount).toBe(1);
  });
});
