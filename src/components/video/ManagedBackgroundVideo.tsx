import { useEffect, useRef, useState, type ReactNode } from "react";

const SOUND_PREFERENCE_KEY = "amVideoSoundPreference";
const TARGET_VOLUME = 0.2;
const MAX_VOLUME = 0.22;
const FADE_STEP_MS = 100;

type SoundState = "on" | "muted" | "blocked";

interface ManagedBackgroundVideoProps {
  id: string;
  className: string;
  videoClassName: string;
  poster: string;
  webmSrc: string;
  mp4Src: string;
  mobileMp4Src: string;
  buttonClassName: string;
  loop?: boolean;
  children?: ReactNode;
}

function getSoundPreference() {
  try {
    return localStorage.getItem(SOUND_PREFERENCE_KEY) || "sound-on";
  } catch {
    return "sound-on";
  }
}

function setSoundPreference(value: "sound-on" | "muted") {
  try {
    localStorage.setItem(SOUND_PREFERENCE_KEY, value);
  } catch {
    // The control still works when private browsing blocks storage.
  }
}

function fadeVolume(video: HTMLVideoElement, target: number, duration: number, callback?: () => void) {
  window.clearInterval(video.dataset.volumeTimer ? Number(video.dataset.volumeTimer) : undefined);

  const safeTarget = Math.min(target, MAX_VOLUME);
  const start = video.volume || 0;
  const steps = Math.max(1, Math.round(duration / FADE_STEP_MS));
  let step = 0;
  const timer = window.setInterval(() => {
    step += 1;
    video.volume = Math.max(0, Math.min(MAX_VOLUME, start + ((safeTarget - start) * step) / steps));
    if (step >= steps) {
      window.clearInterval(timer);
      delete video.dataset.volumeTimer;
      video.volume = safeTarget;
      callback?.();
    }
  }, FADE_STEP_MS);
  video.dataset.volumeTimer = String(timer);
}

export function ManagedBackgroundVideo({
  id,
  className,
  videoClassName,
  poster,
  webmSrc,
  mp4Src,
  mobileMp4Src,
  buttonClassName,
  loop = false,
  children,
}: ManagedBackgroundVideoProps) {
  const frameRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundState, setSoundState] = useState<SoundState>(() => getSoundPreference() === "muted" ? "muted" : "on");

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    const desktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let isHovering = false;
    let isPlaying = false;
    let hasEnded = false;
    let savedCurrentTime = 0;
    let userPaused = false;
    let videoInViewport = true;
    let leftAfterEnding = false;

    video.loop = loop;
    video.playsInline = true;
    video.preload = "metadata";

    const applyPreference = () => {
      if (getSoundPreference() === "muted") {
        video.muted = true;
        video.volume = 0;
        setSoundState("muted");
      } else {
        video.muted = false;
        video.volume = TARGET_VOLUME;
        setSoundState("on");
      }
    };

    const playWithFallback = async () => {
      if (!videoInViewport) return;
      applyPreference();
      try {
        await video.play();
        isPlaying = true;
        userPaused = false;
      } catch {
        video.muted = true;
        video.volume = 0;
        setSoundState(getSoundPreference() === "muted" ? "muted" : "blocked");
        await video.play().then(() => { isPlaying = true; }).catch(() => undefined);
      }
    };

    const pauseAndSave = () => {
      if (!hasEnded) savedCurrentTime = video.currentTime;
      video.pause();
      isPlaying = false;
    };

    const onPointerEnter = () => {
      if (!desktopPointer.matches) return;
      isHovering = true;
      if (hasEnded) {
        if (!leftAfterEnding) return;
        video.currentTime = 0;
        savedCurrentTime = 0;
        hasEnded = false;
        leftAfterEnding = false;
      } else if (savedCurrentTime > 0 && Math.abs(video.currentTime - savedCurrentTime) > 0.1) {
        video.currentTime = savedCurrentTime;
      }
      void playWithFallback();
    };

    const onPointerLeave = () => {
      if (!desktopPointer.matches) return;
      isHovering = false;
      if (hasEnded) leftAfterEnding = true;
      else pauseAndSave();
    };

    const onFrameClick = (event: MouseEvent) => {
      if (desktopPointer.matches || (event.target as HTMLElement).closest("a, button, input, select, textarea")) return;
      if (hasEnded) {
        video.currentTime = 0;
        savedCurrentTime = 0;
        hasEnded = false;
        userPaused = false;
        void playWithFallback();
        return;
      }
      if (video.paused) {
        video.currentTime = savedCurrentTime;
        userPaused = false;
        void playWithFallback();
      } else {
        userPaused = true;
        pauseAndSave();
      }
    };

    const onEnded = () => {
      hasEnded = true;
      isPlaying = false;
      userPaused = false;
      savedCurrentTime = video.duration || video.currentTime;
      video.pause();
      if (!isHovering) leftAfterEnding = true;
    };

    const observer = new IntersectionObserver(([entry]) => {
      videoInViewport = entry.isIntersecting && entry.intersectionRatio > 0.12;
      if (!videoInViewport && isPlaying && !hasEnded) pauseAndSave();
      if (!videoInViewport && hasEnded) leftAfterEnding = true;
      // Visibility alone never starts playback.
      if (videoInViewport && userPaused) video.pause();
    }, { threshold: [0, 0.12, 0.5] });

    applyPreference();
    video.pause();
    observer.observe(frame);
    frame.addEventListener("pointerenter", onPointerEnter);
    frame.addEventListener("pointerleave", onPointerLeave);
    frame.addEventListener("click", onFrameClick);
    video.addEventListener("ended", onEnded);
    return () => {
      observer.disconnect();
      frame.removeEventListener("pointerenter", onPointerEnter);
      frame.removeEventListener("pointerleave", onPointerLeave);
      frame.removeEventListener("click", onFrameClick);
      video.removeEventListener("ended", onEnded);
      window.clearInterval(video.dataset.volumeTimer ? Number(video.dataset.volumeTimer) : undefined);
    };
  }, [loop]);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (soundState === "on" && !video.muted && video.volume > 0) {
      setSoundPreference("muted");
      setSoundState("muted");
      fadeVolume(video, 0, 1000, () => {
        video.muted = true;
        video.volume = 0;
      });
      return;
    }

    setSoundPreference("sound-on");
    video.muted = false;
    video.volume = 0;
    setSoundState("on");
    await video.play().catch(() => undefined);
    fadeVolume(video, TARGET_VOLUME, 2000);
  };

  const buttonText = soundState === "on" ? "Mute" : soundState === "blocked" ? "Enable Sound" : "Sound On";

  return (
    <section ref={frameRef} className={className}>
      <video ref={videoRef} id={id} className={videoClassName} playsInline loop={loop} preload="metadata" poster={poster} aria-hidden="true">
        <source src={mp4Src} type="video/mp4" />
        <source src={webmSrc} type="video/webm" />
        <source src={mobileMp4Src} type="video/mp4" media="(max-width: 768px)" />
      </video>
      <button
        type="button"
        className={`sound-toggle-btn ${buttonClassName} ${soundState === "on" ? "" : "muted"}`}
        aria-label={soundState === "on" ? "Mute video sound" : "Turn video sound on"}
        onClick={toggleSound}
      >
        {buttonText}
      </button>
      {children}
    </section>
  );
}
