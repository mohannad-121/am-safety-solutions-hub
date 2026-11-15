import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { CmsContentBridge } from "@/components/CmsContentBridge";
import { CMS_CONTENT_STORAGE_KEY, defaultContentRecords } from "@/lib/cms";

function renderBridge() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <main>
        <h1>Engineered Safety Systems for Safer UAE Construction Sites</h1>
        <p>Repository homepage summary.</p>
      </main>
      <CmsContentBridge />
    </MemoryRouter>,
  );
}

describe("CmsContentBridge", () => {
  beforeEach(() => localStorage.clear());

  it("keeps repository headings when the CMS record only contains seed metadata", async () => {
    const view = renderBridge();
    await waitFor(() => expect(view.getByRole("heading", { level: 1 })).toHaveTextContent("Engineered Safety Systems"));
  });

  it("applies explicitly published page content", async () => {
    const records = defaultContentRecords.map((record) => record.contentKey === "page.home" ? {
      ...record,
      title: "Custom homepage",
      publishedData: { title: "Published safety heading", summary: "Published safety summary." },
      updatedBy: "admin@ambs.ae",
    } : record);
    localStorage.setItem(CMS_CONTENT_STORAGE_KEY, JSON.stringify(records));

    const view = renderBridge();
    await waitFor(() => expect(view.getByRole("heading", { level: 1 })).toHaveTextContent("Published safety heading"));
    expect(view.getByText("Published safety summary.")).toBeInTheDocument();
  });
});
