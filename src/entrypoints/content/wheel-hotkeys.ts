import type { HotkeyBinding, Hotkeys } from "@/lib/defaults";
import { DEFAULT_HOTKEYS } from "@/lib/defaults";
import { clamp, snapToStep } from "@/lib/math";

import type { Settings } from "./settings";
import { showSpeedOsd, showVolumeOsd } from "./video-osd";

let currentSettings: Settings;

const findVideoNearTarget = (target: Element): HTMLVideoElement | null => {
  if (target.matches("video[data-igvc-init]")) {
    return target as HTMLVideoElement;
  }
  let current: Element | null = target;
  for (let i = 0; i < 12 && current; i += 1) {
    const video = current.querySelector("video[data-igvc-init]");
    if (video) {
      return video as HTMLVideoElement;
    }
    current = current.parentElement;
  }
  return null;
};

const resolveHotkeys = (): Hotkeys =>
  currentSettings.hotkeys ?? DEFAULT_HOTKEYS;

const modifierMatches = (
  e: KeyboardEvent | WheelEvent,
  modifier: HotkeyBinding["modifier"]
): boolean => {
  if (modifier === "ctrl") {
    return e.ctrlKey;
  }
  if (modifier === "shift") {
    return e.shiftKey;
  }
  if (modifier === "alt") {
    return e.altKey;
  }
  return !e.ctrlKey && !e.shiftKey && !e.altKey;
};

const wheelMatchesBinding = (
  e: WheelEvent,
  binding: HotkeyBinding
): boolean => {
  const direction = e.deltaY < 0 ? "wheelup" : "wheeldown";
  if (binding.key !== direction) {
    return false;
  }
  return modifierMatches(e, binding.modifier);
};

const keyMatchesBinding = (
  e: KeyboardEvent,
  binding: HotkeyBinding
): boolean => {
  if (binding.key !== e.key.toLowerCase()) {
    return false;
  }
  return modifierMatches(e, binding.modifier);
};

const adjustSpeed = (video: HTMLVideoElement, delta: number): void => {
  const baseRate = video.playbackRate;
  const newRate = clamp(
    snapToStep(
      baseRate + delta * currentSettings.playbackRateAdjustmentStepSize,
      currentSettings.playbackRateAdjustmentStepSize
    ),
    0.0625,
    128
  );
  browser.storage.local.set({ playbackRate: newRate });
  currentSettings.playbackRate = newRate;
  video.playbackRate = newRate;
  showSpeedOsd(video, newRate);
};

const adjustVolume = (video: HTMLVideoElement, delta: number): void => {
  const newVolume = clamp(
    currentSettings.volumeLevel +
      delta * currentSettings.volumeAdjustmentStepSize,
    0,
    1
  );
  if (video.muted) {
    video.muted = false;
  }
  browser.storage.local.set({ volumeLevel: newVolume });
  currentSettings.volumeLevel = newVolume;
  video.volume = newVolume;
  showVolumeOsd(video, newVolume);
};

const onWheel = (e: WheelEvent): void => {
  const { target } = e;
  if (!(target instanceof Element)) {
    return;
  }

  const video = findVideoNearTarget(target);
  if (!video) {
    return;
  }

  const hotkeys = resolveHotkeys();
  if (wheelMatchesBinding(e, hotkeys.speedUp)) {
    e.preventDefault();
    adjustSpeed(video, 1);
  } else if (wheelMatchesBinding(e, hotkeys.speedDown)) {
    e.preventDefault();
    adjustSpeed(video, -1);
  } else if (wheelMatchesBinding(e, hotkeys.volumeUp)) {
    e.preventDefault();
    adjustVolume(video, 1);
  } else if (wheelMatchesBinding(e, hotkeys.volumeDown)) {
    e.preventDefault();
    adjustVolume(video, -1);
  }
};

const onKeyDown = (e: KeyboardEvent): void => {
  const hotkeys = resolveHotkeys();

  const target = e.target as Element | null;
  if (!target) {
    return;
  }

  const video = findVideoNearTarget(target);
  if (!video) {
    return;
  }

  if (keyMatchesBinding(e, hotkeys.speedUp)) {
    e.preventDefault();
    adjustSpeed(video, 1);
  } else if (keyMatchesBinding(e, hotkeys.speedDown)) {
    e.preventDefault();
    adjustSpeed(video, -1);
  } else if (keyMatchesBinding(e, hotkeys.volumeUp)) {
    e.preventDefault();
    adjustVolume(video, 1);
  } else if (keyMatchesBinding(e, hotkeys.volumeDown)) {
    e.preventDefault();
    adjustVolume(video, -1);
  }
};

export const initWheelHotkeys = (settings: Settings): (() => void) => {
  currentSettings = settings;

  document.addEventListener("wheel", onWheel, {
    capture: true,
    passive: false,
  });
  document.addEventListener("keydown", onKeyDown, { capture: true });

  return () => {
    document.removeEventListener("wheel", onWheel, { capture: true });
    document.removeEventListener("keydown", onKeyDown, { capture: true });
  };
};

export const updateWheelSettings = (settings: Settings): void => {
  currentSettings = settings;
};
