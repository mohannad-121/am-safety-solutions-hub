import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SeoHead } from "./SeoHead";

describe("SeoHead", () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="robots"], meta[name^="twitter:"], meta[property^="og:"], link[rel="canonical"], script[data-ambs-schema="true"]').forEach((node) => node.remove());
  });

  it("creates complete social, robots, canonical and schema metadata", async () => {
    render(<SeoHead title="Test Page" description="Test description" path="/test" schema={[{ "@type": "WebPage" }, { "@type": "FAQPage" }]}/>);
    await waitFor(() => expect(document.title).toBe("Test Page | AM Building Solutions"));
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("max-image-preview:large");
    expect(document.head.querySelector('meta[name="twitter:title"]')?.getAttribute("content")).toBe("Test Page");
    expect(document.head.querySelector('meta[property="og:locale"]')?.getAttribute("content")).toBe("en_AE");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://www.ambs.ae/test");
    expect(document.head.querySelectorAll('script[data-ambs-schema="true"]')).toHaveLength(2);
  });

  it("removes canonical and schema from a noindex 404", async () => {
    render(<SeoHead title="Missing" description="Not found" path="/missing" noindex includeCanonical={false}/>);
    await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toContain("noindex"));
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelectorAll('script[data-ambs-schema="true"]')).toHaveLength(0);
  });
});
