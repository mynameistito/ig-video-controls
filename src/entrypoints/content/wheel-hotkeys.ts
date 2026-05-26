import { clamp, snapToStep } from "../../lib/math";
import type { Settings } from "./settings";

let rmbHeld = false;
let rmbUsedWheel = false;
let currentSettings: Settings;

const onMouseDown = (e: MouseEvent): void => {
  if (e.button === 2) {
    rmbHeld = true;
  }
};

const onMouseUp = (e: MouseEvent): void => {
  if (e.button === 2) {
    rmbHeld = false;
  }
};

const onContextMenu = (e: MouseEvent): void => {
  if (rmbUsedWheel) {
    e.preventDefault();
    rmbUsedWheel = false;
  }
};

const onWheel = (e: WheelEvent): void => {
  const target = e.target as Element | null;
  if (!target) {
    return;
  }

  const video = target.closest(
    "video[data-igvc-init]"
  ) as HTMLVideoElement | null;
  if (!video) {
    return;
  }

  if (e.ctrlKey) {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const newRate = clamp(
      snapToStep(
        currentSettings.playbackRate +
          direction * currentSettings.playbackRateAdjustmentStepSize,
        currentSettings.playbackRateAdjustmentStepSize
      ),
      0.0625 / 8,
      128
    );
    browser.storage.local.set({ playbackRate: newRate });
    video.playbackRate = newRate;
  } else if (rmbHeld) {
    e.preventDefault();
    rmbUsedWheel = true;
    const direction = e.deltaY > 0 ? -1 : 1;
    const newVolume = clamp(
      currentSettings.volumeLevel +
        direction * currentSettings.volumeAdjustmentStepSize,
      0,
      1
    );
    browser.storage.local.set({ volumeLevel: newVolume });
    video.volume = newVolume;
  }
};

export const initWheelHotkeys = (settings: Settings): (() => void) => {
  currentSettings = settings;

  document.addEventListener("mousedown", onMouseDown, { capture: true });
  document.addEventListener("mouseup", onMouseUp, { capture: true });
  document.addEventListener("contextmenu", onContextMenu, {
    capture: true,
  });
  document.addEventListener("wheel", onWheel, {
    capture: true,
    passive: false,
  });

  return () => {
    document.removeEventListener("mousedown", onMouseDown, { capture: true });
    document.removeEventListener("mouseup", onMouseUp, { capture: true });
    document.removeEventListener("contextmenu", onContextMenu, {
      capture: true,
    });
    document.removeEventListener("wheel", onWheel, { capture: true });
  };
};

export const updateWheelSettings = (settings: Settings): void => {
  currentSettings = settings;
};
