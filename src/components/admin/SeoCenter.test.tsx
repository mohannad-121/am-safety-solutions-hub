import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SeoCenter } from "./SeoCenter";

describe("SeoCenter", () => {
  beforeEach(() => localStorage.clear());

  it("shows an honest empty state and manual evaluation action", () => {
    render(<SeoCenter user={{ id: "test", email: "admin@ambs.ae", role: "admin", mfaRequired: false }} />);
    expect(screen.getByText("Daily review and approval queue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Run SEO Evaluation/i })).toBeInTheDocument();
    expect(screen.getByText("No audit has run yet")).toBeInTheDocument();
  });
});
