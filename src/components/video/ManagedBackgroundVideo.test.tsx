import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ManagedBackgroundVideo } from "./ManagedBackgroundVideo";

let desktopPointer = true;
let paused = true;
let observerCallback: IntersectionObserverCallback;

class ObserverMock {
  constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
  observe(target: Element) { observerCallback([{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
  disconnect() {}
  unobserve() {}
  takeRecords() { return []; }
  root = null;
  rootMargin = "0px";
  thresholds = [0, .12, .5];
}

const props = {
  id: "testVideo",
  className: "frame",
  videoClassName: "video",
  poster: "/poster.jpg",
  webmSrc: "/video.webm",
  mp4Src: "/video.mp4",
  mobileMp4Src: "/video-mobile.mp4",
  buttonClassName: "sound",
};

describe("ManagedBackgroundVideo", () => {
  beforeEach(() => {
    desktopPointer = true;
    paused = true;
    localStorage.clear();
    vi.stubGlobal("IntersectionObserver", ObserverMock);
    vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("hover: hover") ? desktopPointer : false, media: query, addEventListener() {}, removeEventListener() {} }));
    Object.defineProperty(HTMLMediaElement.prototype, "paused", { configurable: true, get: () => paused });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(async () => { paused = false; });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => { paused = true; });
  });

  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("resumes safely through 20 hover cycles and only restarts after leaving an ended video", async () => {
    const { container } = render(<ManagedBackgroundVideo {...props}/>);
    const frame = container.querySelector("section")!;
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "duration", { configurable: true, value: 12 });

    expect(video.loop).toBe(false);
    expect(paused).toBe(true);
    for (let cycle = 1; cycle <= 20; cycle += 1) {
      fireEvent.pointerEnter(frame);
      await Promise.resolve();
      expect(paused).toBe(false);
      video.currentTime = cycle / 2;
      fireEvent.pointerLeave(frame);
      expect(paused).toBe(true);
      video.currentTime = 0;
      fireEvent.pointerEnter(frame);
      expect(video.currentTime).toBe(cycle / 2);
      fireEvent.pointerLeave(frame);
    }

    fireEvent.pointerEnter(frame);
    video.currentTime = 12;
    fireEvent.ended(video);
    expect(paused).toBe(true);
    expect(video.currentTime).toBe(12);
    fireEvent.pointerLeave(frame);
    fireEvent.pointerEnter(frame);
    expect(video.currentTime).toBe(0);
    expect(paused).toBe(false);
  });

  it("uses tap to play, pause, resume and restart on touch devices", async () => {
    desktopPointer = false;
    const { container } = render(<ManagedBackgroundVideo {...props}/>);
    const frame = container.querySelector("section")!;
    const video = container.querySelector("video")!;
    Object.defineProperty(video, "duration", { configurable: true, value: 8 });

    fireEvent.click(frame);
    await Promise.resolve();
    expect(paused).toBe(false);
    video.currentTime = 3;
    fireEvent.click(frame);
    expect(paused).toBe(true);
    video.currentTime = 0;
    fireEvent.click(frame);
    expect(video.currentTime).toBe(3);
    fireEvent.ended(video);
    fireEvent.click(frame);
    expect(video.currentTime).toBe(0);
    expect(paused).toBe(false);
  });

  it("pauses out of view without autoplaying when visibility returns", async () => {
    const { container } = render(<ManagedBackgroundVideo {...props}/>);
    const frame = container.querySelector("section")!;
    fireEvent.pointerEnter(frame);
    await Promise.resolve();
    expect(paused).toBe(false);
    observerCallback([{ isIntersecting: false, intersectionRatio: 0, target: frame } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(paused).toBe(true);
    observerCallback([{ isIntersecting: true, intersectionRatio: .5, target: frame } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    expect(paused).toBe(true);
  });
});
