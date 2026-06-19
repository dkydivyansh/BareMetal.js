# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2026-06-19

### Added
- Added comprehensive documentation pages for `BareMetal.init()` configuration options (`api-config.html`).

### Changed
- Updated the documentation site to dog-food the live jsdelivr CDN for its BareMetal imports.

### Fixed
- Fixed the router to correctly ignore anchor links and navigations that only modify the URL hash fragment (`#hash`), preventing unnecessary page reloads and pre-fetches.

## [1.2.0] - 2026-06-18

### Added
- Auto-Request Cancellation (AbortController) to prevent bandwidth waste on rapid navigation.
- Component Lazy Loading via IntersectionObserver (`lazy` property in loader).
- State Hydration (`persistState`) to automatically recover from browser hard reloads.
- DOM Virtualization Helper (`Virtualizer`) to render massive lists with zero jank.


## [1.0.0] - 2026-06-17

### Added
- Initial release of BareMetal.js
- Hover Pre-fetching (0ms latency navigation)
- Smart Module Keep-Alive (preserve DOM nodes across pages)
- Scroll Memory & Programmatic Back
- Reactive State Management (Pub/Sub and Signals)
- Custom Page Transitions API
- Error Boundary and Navigation Fallback
- Auto-Wrap feature for non-conforming modules
