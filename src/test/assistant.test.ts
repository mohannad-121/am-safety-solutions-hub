import { describe, expect, it } from "vitest";
import { answerCustomer } from "@/lib/assistant";

describe("local customer assistant", () => {
  it("responds conversationally to a greeting", () => {
    expect(answerCustomer("How are you?").text).toMatch(/hello|ready/i);
  });
  it("recommends edge protection for slab work", () => {
    const reply = answerCustomer("We have an open slab edge");
    expect(reply.text).toMatch(/edge-protection|edge protection/i);
    expect(reply.links.some((link) => link.path.includes("edge-protection"))).toBe(true);
  });
  it("provides quotation guidance", () => {
    expect(answerCustomer("I need a qoute").links.some((link) => link.path === "/quote")).toBe(true);
  });
});
