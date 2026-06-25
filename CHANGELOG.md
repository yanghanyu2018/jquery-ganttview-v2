# Changelog

## v0.6.7-airport-resource-timeline-docs

Documentation and GitHub package cleanup.

- Rewrote README as a bilingual GitHub-oriented introduction.
- Added `docs/API.md`.
- Added `docs/DATA_MODEL.md`.
- Added `docs/I18N.md`.
- Added `docs/AIRPORT_RESOURCE_TIMELINE.md`.
- Added `docs/EXAMPLES.md`.
- Added `VERSION` marker.
- Added `dist/` copy of core JS/CSS for release-style packaging.
- Updated core JS version header.
- No intentional runtime behavior change from v0.6.6 i18n.

## v0.6.6-airport-resource-timeline-i18n

- Added lightweight i18n support.
- Built-in locales: `zh-CN`, `en-US`, `fr-FR`, `de-DE`, `th-TH`.
- Added runtime `setLocale()` API.
- Added `$.fn.ganttView.addLanguage()` for custom language packs.
- Updated examples with locale selectors.

## v0.6.5

- Added prompt for exact time after horizontal drag.
- Empty prompt keeps default grid alignment.
- Supports both same-row and cross-row horizontal moves.

## v0.6.4

- Fixed current-time range button behavior in examples.
- Improved `gotoNow()` boundary handling.

## v0.6.3

- Added current-time range buttons to `example/index.html` and `example/index2.html`.

## v0.6.2

- Fixed conflict highlight priority over custom colors.
- Normalized planned/estimated/actual time layer height.
- Fixed cross-row + horizontal move behavior.

## v0.6.1

- Fixed row/block alignment issues.
- Increased default block height for airport use.
- Prevented blocks from entering header area.

## v0.6.0

- Enabled horizontal time move in hour mode.
- Enabled left/right resize in hour mode.
- Added time snap configuration.
- Improved task data synchronization after drag/resize.

## v0.5.0

- Added lightweight row windowing.
- Added planned/estimated/actual time layers.
- Added auto legend.
- Added rolling window API.

## v0.4.0

- Added airport resource semantics.
- Added `resourceType`, `status`, planned/estimated/actual fields.
- Added visible window, buffer time, minimum block width and task navigation API.
