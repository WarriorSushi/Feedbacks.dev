# Remote Configuration and Product Naming Decision

**Date:** 2026-07-20
**Status:** Approved

## Decision

The owner-facing product is named **Release notes**. Its purpose is stated explicitly in the dashboard: publish “What’s new” announcements inside the customer’s own product. The visitor-facing announcement eyebrow remains **What’s New**.

The dashboard navigation uses separate product homes for **Feedback form** and **Release notes**, plus a shared **Embed installation** destination.

The browser embed is installed once. Its snippet contains only the browser-safe project key and a stable host element. Feedback form configuration and product module activation are resolved from the public widget bootstrap on page load. Saving placement, copy, fields, styling, screenshots, attachments, or captcha settings does not regenerate or invalidate the installed snippet.

## Safety and compatibility

- The public bootstrap returns a strict allowlist of browser-safe configuration fields.
- Server-only module preferences and private credentials are never included in the public configuration object.
- Captcha site keys are public browser configuration; captcha secrets remain server-side.
- A valid remote configuration and the last verified Feedback module preference are cached locally so a temporary bootstrap outage preserves the last verified experience, including Release-notes-only installs.
- Legacy data-attribute configuration remains an outage and backwards-compatibility fallback.
- Existing `/updates` and install-customize links remain compatible even though the canonical owner-facing labels are **Release notes** and **Feedback form**.

This decision supersedes earlier requirements to regenerate install code after customization and the owner-facing **Updates** label. Content, publication, privacy, metrics, and end-user behavior from the existing Product Updates specifications remain unchanged.
