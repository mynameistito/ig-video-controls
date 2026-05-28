---
"ig-video-controls": minor
---

Add customizable hotkey system with popup UI for rebinding keyboard and wheel shortcuts

- Replace hardcoded right-mouse-button + wheel volume control with a configurable hotkey binding system
- Add `Hotkeys` type with `speedUp`, `speedDown`, `volumeUp`, `volumeDown` bindings, each supporting a modifier key (ctrl/shift/alt/none)
- Add popup UI at `src/entrypoints/popup/` for rebinding shortcuts interactively (click a row, press keys or scroll to rebind)
- Add conflict detection when two actions share the same shortcut
- Support keyboard shortcuts in addition to wheel bindings for speed and volume control
- Defaults remain unchanged: Ctrl+Wheel for speed, plain Wheel for volume
