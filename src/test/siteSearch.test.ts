import { describe, expect, it } from "vitest";
import { searchSite } from "@/lib/siteSearch";

describe("predictive site search", () => {
  it("corrects a misspelled safety net query", () => {
    expect(searchSite("saftey nett").some((item) => /safety net/i.test(item.title))).toBe(true);
  });

  it("corrects edge protection spelling", () => {
    expect(searchSite("edge protction").some((item) => item.path.includes("edge-protection"))).toBe(true);
  });

  it("predicts debris net content", () => {
    expect(searchSite("debries net").some((item) => /net|debris/i.test(`${item.title} ${item.text}`))).toBe(true);
  });

  it("returns popular content for an empty query", () => {
    expect(searchSite("", 8)).toHaveLength(8);
  });
});
