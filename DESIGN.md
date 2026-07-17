# Design

Visual system for the Christian De Asis portfolio. Single stylesheet: `styles/portfolio.css`. Zero-build static site; all interactions in `scripts/portfolio.js` (vanilla, reduced-motion aware).

## Theme

Dark-first with a full light theme, toggled via `data-theme` on `<html>`, persisted in `localStorage` (`cda-theme`). All color in OKLCH. `color-scheme` set per theme.

## Color

Accent family (shared across themes):

| Token | Value | Role |
|-------|-------|------|
| `--violet` | `oklch(0.66 0.2 285)` | Primary accent |
| `--violet-bright` | `oklch(0.72 0.19 288)` | Accent hover/bright |
| `--indigo` | `oklch(0.64 0.18 268)` | Secondary accent |
| `--cyan` | `oklch(0.78 0.13 215)` | Tertiary accent |

Dark theme: `--bg oklch(0.155 0.014 285)`, `--bg-deep 0.125`, `--surface 0.188`, `--surface-2 0.225`; text ramp `--text 0.97` / `--text-dim 0.74` / `--text-faint 0.56`; hairlines as white alphas (`--line oklch(1 0 0 / 0.09)`). Light theme mirrors with dark alphas. Soft accent wash `--accent-soft`, glow `--glow` for primary-button shadow.

Strategy: restrained — tinted violet-hue neutrals plus one accent used sparingly (kickers, dots, focus, CTAs). Gradient text and glow orbs are retired (2026-07 backend repositioning); accents are structural: accent-bordered diagram nodes, state chips, the quote glyph on callouts.

## Typography

| Role | Family | Notes |
|------|--------|-------|
| Display / headings | Space Grotesk 400–700 | `-0.02em` to `-0.045em` tracking, line-height ~1.02 |
| Body | Hanken Grotesk 400–800 | line-height 1.6 |
| Mono (labels, meta) | JetBrains Mono 400–600 | uppercase tracked labels, code accents |

Fluid scale (`clamp()`): `--fs-mono 0.7–0.8rem`, `--fs-sm`, `--fs-base 1–1.12rem`, `--fs-lg`, `--fs-xl`, `--fs-2xl 2–3.4rem`, `--fs-3xl 2.6–5rem`, `--fs-display 3.2–8.5rem`. Loaded via Google Fonts (`display=swap`). These families are the committed identity — identity-preservation wins over reflex-reject lists.

## Spacing & Layout

Spacing tokens `--space-1` (0.5rem) → `--space-9` (10rem). Containers: `--container 1240px`, `--container-narrow 820px`; fluid inline padding `clamp(1.2rem, 4vw, 2.5rem)`. Section rhythm `.section-pad: clamp(4.5rem, 9vw, 9rem)`. Radii: `--radius 14px`, `--radius-lg 22px`, pill `999px`.

Grid habits: two-column feature rows that alternate (`.project` / `.project.flip`), 1px-gap bordered grids on `--line` background for cells (skills, stats, facts, metrics), sticky aside + prose column for case studies (`.cs-layout`, 240px + 1fr).

## Motion

Ease: `--ease cubic-bezier(0.22,1,0.36,1)` (out-quint feel), `--dur 0.6s`. Patterns: scroll-reveal via `[data-reveal]` (opacity + 28px translate, per-element `--reveal-delay`, `[data-stagger]` parent helper), clip reveal `[data-reveal-clip]`, count-up `[data-count]`, magnetic hover `[data-magnetic]`, pointer-spotlight on project cards (`--mx`/`--my`), custom cursor dot + trailing ring (desktop only), marquee ticker, scroll-progress bar. Every pattern has a `prefers-reduced-motion` fallback and a failsafe timeout so content never ships hidden.

## Components

- **Nav**: fixed, blur+translucent on scroll, hides on scroll-down; mobile full-screen overlay menu.
- **Buttons**: `.btn-primary` (accent fill, glow shadow), `.btn-ghost` (hairline), pill radius, `.btn-sm`.
- **Chips / skill-tags**: mono, hairline pill on surface; `.chip-dot` accent dot.
- **Mockup frame**: browser-chrome frame (`.mockup-bar` dots + url) around screenshots (`.mockup-canvas.has-shot .shot`) with `sample data` badge and lightbox zoom (`.lightbox`, Esc/backdrop close).
- **System diagram kit** (`.diagram`, `.d-node`, `.d-link`, `.d-row`, `.d-hlink`, `.d-note`, `.d-states`): mono pill nodes with hairline connectors and an animated pulse dot (`--d-delay` stagger, reduced-motion static). Used for the hero `.sys-card` (real Dunly pipeline) and every project frame that lacks a real screenshot — honest "system sketch" placeholders, never fake product shots.
- **Hero lockup**: H1 line one at display size, line two (`.hero h1 .dim`) as a dim block at 0.5em — statement + support, no gradient.
- **Case-study kit**: `.cs-hero` (chip, title, tagline, 4-up facts grid, cover), `.cs-section` sticky-aside layout, `.cs-callout` pull-quote, `.cs-metrics` 4-up, `.cs-next` footer link.
- **Forms**: mono uppercase labels, focus ring `--accent-soft`, inline `.err` slide-down, status line.
- **Timeline**: left rail + dot markers, hover indent.
- **Footer**: oversized ghost wordmark (`.footer-big`, 6% opacity).

## Imagery

Product screenshots at 2× (2560×1494) inside mockup frames, `object-fit: cover; object-position: top center`, lazy-loaded, honest `sample data` badges. Placeholder frames use dashed-label pattern (being replaced as real captures land).

## Accessibility

`:focus-visible` outline on accent; reduced-motion kills all animation; touch devices skip cursor/magnetic/spotlight; `aria-label`s on icon-only controls; lightbox is `role="dialog"` with focus restore.
