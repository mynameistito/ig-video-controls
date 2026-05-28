import type { Hotkeys, HotkeyBinding, ModifierKey } from "@/lib/defaults";
import { DEFAULT_HOTKEYS } from "@/lib/defaults";

type HotkeyAction = keyof Hotkeys;

const ACTIONS: { id: HotkeyAction; label: string }[] = [
  { id: "speedUp", label: "Speed Up" },
  { id: "speedDown", label: "Speed Down" },
  { id: "volumeUp", label: "Volume Up" },
  { id: "volumeDown", label: "Volume Down" },
];

const MODIFIER_KEYS = new Set(["control", "shift", "alt", "meta"]);

let hotkeys: Hotkeys = { ...DEFAULT_HOTKEYS };
let recordingAction: HotkeyAction | null = null;

const DISPLAY_NAMES: Record<string, string> = {
  " ": "Space",
  arrowdown: "Down",
  arrowleft: "Left",
  arrowright: "Right",
  arrowup: "Up",
  backspace: "Backspace",
  delete: "Del",
  enter: "Enter",
  escape: "Esc",
  tab: "Tab",
  wheeldown: "Wheel Down",
  wheelup: "Wheel Up",
};

const formatKey = (key: string): string => {
  if (DISPLAY_NAMES[key]) {
    return DISPLAY_NAMES[key];
  }
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key;
};

const formatBinding = (binding: HotkeyBinding): string => {
  const parts: string[] = [];
  if (binding.modifier === "ctrl") {
    parts.push("Ctrl");
  } else if (binding.modifier === "shift") {
    parts.push("Shift");
  } else if (binding.modifier === "alt") {
    parts.push("Alt");
  }
  parts.push(formatKey(binding.key));
  return parts.join(" + ");
};

const hasConflict = (action: HotkeyAction, binding: HotkeyBinding): boolean => {
  for (const other of ACTIONS) {
    if (other.id === action) {
      continue;
    }
    const otherBinding = hotkeys[other.id];
    if (
      otherBinding.modifier === binding.modifier &&
      otherBinding.key === binding.key
    ) {
      return true;
    }
  }
  return false;
};

const save = async (): Promise<void> => {
  await browser.storage.local.set({ hotkeys });
};

const buildHtml = (): string => {
  let anyConflict = false;
  let html = "<h1>Keyboard Shortcuts</h1>";

  for (const { id, label } of ACTIONS) {
    const binding = hotkeys[id];
    const isRecording = recordingAction === id;
    const conflict = !isRecording && hasConflict(id, binding);
    if (conflict) {
      anyConflict = true;
    }

    html += `
      <div class="binding${isRecording ? " recording" : ""}${conflict ? " conflict" : ""}" data-action="${id}">
        <span class="binding-label">${label}</span>
        <span class="binding-value">${
          isRecording ? "Press keys..." : formatBinding(binding)
        }</span>
      </div>`;
  }

  html += `<div class="conflict${anyConflict ? " visible" : ""}">Conflict detected — two actions share the same shortcut.</div>`;
  html += `<button class="reset-btn">Reset to Defaults</button>`;
  html += `<p class="hint">Click a row to rebind. Hold modifier + key/scroll.</p>`;

  return html;
};

const render = (): void => {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) {
    return;
  }
  app.innerHTML = buildHtml();
};

const resolveModifier = (e: KeyboardEvent | WheelEvent): ModifierKey => {
  if (e.ctrlKey) {
    return "ctrl";
  }
  if (e.shiftKey) {
    return "shift";
  }
  if (e.altKey) {
    return "alt";
  }
  return null;
};

const finalizeBinding = async (
  action: HotkeyAction,
  modifier: ModifierKey,
  key: string
): Promise<void> => {
  hotkeys[action] = { key, modifier };
  recordingAction = null;
  await save();
  render();
};

const onKeyDown = (e: KeyboardEvent): void => {
  if (!recordingAction) {
    return;
  }

  if (MODIFIER_KEYS.has(e.key.toLowerCase())) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  if (e.key === "Escape") {
    recordingAction = null;
    render();
    return;
  }

  const modifier = resolveModifier(e);
  finalizeBinding(recordingAction, modifier, e.key.toLowerCase());
};

const onWheel = (e: WheelEvent): void => {
  if (!recordingAction) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const direction = e.deltaY < 0 ? "wheelup" : "wheeldown";
  const modifier = resolveModifier(e);

  finalizeBinding(recordingAction, modifier, direction);
};

const onContextMenu = (e: MouseEvent): void => {
  if (recordingAction) {
    e.preventDefault();
  }
};

const init = async (): Promise<void> => {
  const stored = await browser.storage.local.get("hotkeys");
  if (stored.hotkeys) {
    hotkeys = { ...DEFAULT_HOTKEYS, ...stored.hotkeys };
  }

  render();

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("wheel", onWheel, { passive: false });
  document.addEventListener("contextmenu", onContextMenu);

  const app = document.querySelector<HTMLElement>("#app");
  if (app) {
    app.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const binding = target.closest<HTMLElement>(".binding");
      if (binding?.dataset.action) {
        recordingAction = binding.dataset.action as HotkeyAction;
        render();
        return;
      }

      if (target.closest(".reset-btn")) {
        hotkeys = {
          speedDown: { ...DEFAULT_HOTKEYS.speedDown },
          speedUp: { ...DEFAULT_HOTKEYS.speedUp },
          volumeDown: { ...DEFAULT_HOTKEYS.volumeDown },
          volumeUp: { ...DEFAULT_HOTKEYS.volumeUp },
        };
        recordingAction = null;
        await save();
        render();
      }
    });
  }
};

init();
