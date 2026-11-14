import { beforeEach, describe, expect, it } from "vitest";
import {
  CMS_IMAGE_STORAGE_KEY,
  canManageMedia,
  canPublish,
  defaultImageSlots,
  getCachedImageSlots,
  imageLiveStatus,
  resolvePublishedImage,
} from "@/lib/cms";

describe("AMBS CMS image slots", () => {
  beforeEach(() => localStorage.clear());

  it("preserves repository images as public fallbacks", () => {
    expect(resolvePublishedImage("/assets/images/safety-net-systems.jpg")).toBe("/assets/images/safety-net-systems.jpg");
    expect(getCachedImageSlots().length).toBeGreaterThanOrEqual(9);
  });

  it("resolves a published replacement by original image URL", () => {
    const slots = defaultImageSlots.map(slot => slot.id === "shared.edge-protection" ? { ...slot, publishedImageUrl: "https://cdn.example.com/new-edge.webp" } : slot);
    localStorage.setItem(CMS_IMAGE_STORAGE_KEY, JSON.stringify(slots));
    expect(resolvePublishedImage("/assets/images/edge-protection-systems.jpg")).toBe("https://cdn.example.com/new-edge.webp");
    expect(imageLiveStatus(getCachedImageSlots().find(slot => slot.id === "shared.edge-protection")!)).toBe("Live");
  });

  it("enforces publishing and media role boundaries", () => {
    expect(canPublish("admin")).toBe(true);
    expect(canPublish("media_manager")).toBe(false);
    expect(canManageMedia("media_manager")).toBe(true);
    expect(canManageMedia("content_editor")).toBe(false);
  });
});
