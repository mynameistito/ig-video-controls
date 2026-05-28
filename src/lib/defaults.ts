export type ModifierKey = "ctrl" | "shift" | "alt" | null;

export interface HotkeyBinding {
  key: string;
  modifier: ModifierKey;
}

export interface Hotkeys {
  speedDown: HotkeyBinding;
  speedUp: HotkeyBinding;
  volumeDown: HotkeyBinding;
  volumeUp: HotkeyBinding;
}

export interface Settings {
  hotkeys: Hotkeys;
  playbackRate: number;
  playbackRateAdjustmentStepSize: number;
  rememberPlaybackRate: boolean;
  rememberVolumeLevel: boolean;
  volumeAdjustmentStepSize: number;
  volumeLevel: number;
}

export const DEFAULT_HOTKEYS: Hotkeys = {
  speedDown: { key: "wheeldown", modifier: "ctrl" },
  speedUp: { key: "wheelup", modifier: "ctrl" },
  volumeDown: { key: "wheeldown", modifier: null },
  volumeUp: { key: "wheelup", modifier: null },
};

export const DEFAULTS: Settings = {
  hotkeys: DEFAULT_HOTKEYS,
  playbackRate: 1,
  playbackRateAdjustmentStepSize: 0.25,
  rememberPlaybackRate: true,
  rememberVolumeLevel: true,
  volumeAdjustmentStepSize: 0.1,
  volumeLevel: 1,
};
