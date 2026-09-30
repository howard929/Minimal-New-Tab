# Privacy Policy — Minimal New Tab

[English](PRIVACY.md) | [简体中文](PRIVACY.zh-CN.md)

Last updated: 2026-10-01

Minimal New Tab is designed as a local-first Microsoft Edge extension.

## Data stored locally

The extension stores user-created shortcuts, appearance settings, search settings, sync preferences, and related configuration in browser extension storage/local storage.

If the user selects a custom background image, that image is stored locally in the extension's IndexedDB on that device.

## Optional browsing-history access

Browsing-history access is optional.

The extension requests the `history` permission only after the user explicitly enables the browsing-history suggestions feature.

When enabled, browsing history is queried locally to show recent or frequently visited pages as search-box suggestions.

Browsing-history contents are not sent to a developer-operated server or third-party analytics service.

Permission grants are device-local and are not synchronized by the extension.

## Favicons

The extension uses Chromium's built-in `favicon` capability to display website icons. It does not use an external favicon service.

## Edge account sync

If the user enables Edge account sync inside the extension, the extension uses the browser-provided `chrome.storage.sync` API to synchronize normal configuration data such as shortcuts and appearance/search settings.

The extension does not operate its own sync server.

The custom background image is not synchronized.

Browser permission grants are not synchronized by the extension.

Synced data is handled by the browser/platform account sync infrastructure.

## Import / export

The user may export a JSON backup of the extension configuration. A backup can include the locally selected background image.

Exported backup files are created only at the user's request and are saved or handled by the user's browser/device.

## Analytics, advertising, and tracking

The extension contains:

- No advertising
- No third-party analytics
- No developer-operated telemetry
- No developer-operated account or sync server

## User controls

Users can:

- Disable Edge account sync in the extension.
- Disable browsing-history suggestions and remove the optional history permission.
- Export or import their configuration.
- Remove a local background image.
- Clear local extension data from the settings page.
- Remove the extension through Microsoft Edge.

## Changes

This policy may be updated if the extension's data handling changes. Material changes should be reflected in the repository and, where applicable, the Microsoft Edge Add-ons listing.
