<p align="center">
  <img src="assets/icons/logo.png" width="160" alt="Minimal New Tab Logo">
</p>

<h1 align="center">Minimal New Tab</h1>

<p align="center">
  A local-first, minimal and customizable new tab extension for Microsoft Edge.
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.zh-CN.md">简体中文</a>
</p>

Minimal New Tab is a local-first Microsoft Edge new-tab extension focused on a clean, user-controlled start page.

> **Source-available, non-commercial.** Personal use, study, modification, and non-commercial redistribution are permitted under the PolyForm Noncommercial License 1.0.0. Commercial use requires separate permission.

## Features

- Add, edit, delete, and drag shortcuts to reorder them.
- Choose 1–3 shortcut rows, up to 8 shortcuts per row.
- Large / Small shortcut layout presets.
- Chromium-provided favicons with no third-party favicon service.
- Optional semi-transparent icon backgrounds for busy wallpapers.
- Six editable solid-color presets plus a custom color picker.
- Local custom background images.
- Background blur and subtle dimming while the search box is active.
- Narrow / Medium / Wide search box widths.
- Bing / Google / Baidu search.
- Optional local browsing-history suggestions with a configurable suggestion count.
- JSON import / export backup, including the local background image.
- Optional Edge account sync for shortcuts and normal settings.

## Privacy by design

Minimal New Tab does not use advertising, analytics, or developer-operated telemetry.

The optional `history` permission is requested only when the user explicitly enables browsing-history suggestions. History data is queried locally to produce suggestions and is not sent to a developer-operated server.

Custom background images stay on the local device. Edge sync uses the browser-provided `chrome.storage.sync` mechanism and does not sync the background image or browser permission grants.

See [PRIVACY.md](PRIVACY.md) for the full policy.

## Synced settings

When Edge account sync is enabled inside the extension, the following can sync between installations of the same extension:

- Shortcuts, URLs, and order
- Shortcut row count
- Shortcut size
- Search engine
- Search-box width
- Auto-focus preference
- Favicon preference
- Icon-background preference
- Solid background color
- Six saved color slots and selected slot
- History-suggestions preference
- History suggestion count

Not synced:

- The actual custom background image
- Browser permission grants such as `history`

If the history-suggestions preference arrives on another device, the user must still grant the history permission on that device.

## Installation

### Microsoft Edge Add-ons

The public store link will be added here after the extension is published.

### Developer mode

1. Download or clone this repository.
2. Open `edge://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.

## Updating a developer-mode installation

Keep the same local extension folder so the unpacked extension keeps the same local identity on that computer.

1. Replace the runtime files with the new version.
2. Open `edge://extensions`.
3. Click **Reload** on Minimal New Tab.

## Permissions

Required:

- `favicon` — displays website icons through Chromium's built-in favicon mechanism.
- `storage` — stores configuration and supports browser-provided sync storage.

Optional:

- `history` — requested only after the user enables local browsing-history suggestions.

The extension does not request broad host permissions.

## Import and export

The built-in JSON backup can be used for manual migration or full backups. Unlike account sync, the export can include the locally selected background image.

## Repository structure

```text
.
├── manifest.json
├── newtab.html
├── style.css
├── script.js
├── README.md
├── README.zh-CN.md
├── PRIVACY.md
├── PRIVACY.zh-CN.md
├── CHANGELOG.md
├── CHANGELOG.zh-CN.md
├── CONTRIBUTING.md
├── CONTRIBUTING.zh-CN.md
├── SECURITY.md
├── LICENSE
├── NOTICE
└── assets/
```

## Contributing

Non-commercial contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

This project is **source-available**, not OSI open source.

It is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE).

Permitted examples include personal use, study, experimentation, modification, hobby projects, and non-commercial redistribution. Commercial use, resale, paid distribution, or use as part of a commercial product or service requires separate permission from the author.

Required notice:

> Copyright © 2026 Haowei Wang

For the legally controlling terms, see [LICENSE](LICENSE).
