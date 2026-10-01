# Changelog

[English](CHANGELOG.md) | [简体中文](CHANGELOG.zh-CN.md)

All notable changes to Minimal New Tab are documented here.

## 1.1.0 — 2026-10-01

- Fixed the new-tab background blur/zoom flicker when clicking the empty page area by removing the delayed auto-focus race and clearing the visual state immediately on outside clicks.
- Automatic search-box focus no longer triggers the background visual effect by itself.
- Added a **Search focus background effect** setting. It is enabled by default and can be disabled at any time.
- The new setting is included in Edge account sync and JSON import/export.

## 1.0.5 — 2026-10-01

- Vertically centered the shortcut icon/background + label group inside each shortcut card.
- Kept the top-right edit control independently anchored.
- Applied the alignment fix to website shortcuts and the Add Shortcut tile in both Large and Small modes.

## 1.0.4

- Simplified shortcut size labels to Large / Small.
- Increased outer shortcut-card width for a more relaxed layout.
- Increased spacing between the icon background and the edit control.
- Slightly reduced and repositioned the edit control.

## 1.0.3

- Added Large / Small shortcut layout presets.
- Preserved the optional semi-transparent icon background in both layouts.
- Added shortcut-size sync and backup support.

## 1.0.2

- Refined shortcut-card width and edit-control positioning.
- Preserved 8 shortcuts per row and centered wrapping.

## 1.0.1

- Changed shortcut hover cursor to the standard pointer while retaining drag-to-reorder.

## 1.0.0

- First stable release.
- Custom shortcuts with add, edit, delete, and drag sorting.
- 1–3 shortcut rows, up to 8 shortcuts per row.
- Chromium favicon support.
- Optional icon background.
- Solid colors, editable color slots, and local background image.
- Search-focus background blur/dimming.
- Search-box width options.
- Bing / Google / Baidu search.
- Optional local history suggestions.
- JSON import/export.
- Edge account sync for ordinary settings, excluding local background images and browser permission grants.
