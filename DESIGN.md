# Design Specification: Museé Chromatique (Gallery Minimalist)

## 1. Design Philosophy
The "Museé Chromatique" system prioritizes content as art. It utilizes a high-contrast, minimalist framework characterized by expansive negative space, sophisticated editorial typography, and a curated palette of vibrant accent tokens. The interface should feel like a contemporary art gallery: silent, structured, and premium.

## 2. Color Tokens (The Curated Palette)
Colors are categorized into "Foundations" (the gallery walls) and "Exhibits" (the focal points).

### 2.1 Foundation Tokens
- `color-bg-canvas`: #FAFAFA (Off-white, non-reflective)
- `color-bg-surface`: #FFFFFF (Pure white for elevated cards)
- `color-text-primary`: #121212 (Deep obsidian for maximum legibility)
- `color-text-secondary`: #666666 (Muted slate for metadata)
- `color-border-subtle`: #E5E5E5 (Hairline dividers)

### 2.2 Exhibit Tokens (Accents)
- `color-accent-vermillion`: #E63946 (Primary action/focal point)
- `color-accent-cobalt`: #0047AB (Secondary interaction)
- `color-accent-ochre`: #D4A017 (Highlight/Notification)
- `color-accent-viridian`: #005F56 (Success/Stability)

## 3. Typography (Editorial Hierarchy)
The system employs a high-contrast typographic scale to mimic exhibition signage.

- `font-family-display`: "Playfair Display", serif (For headers and titles)
- `font-family-interface`: "Inter", sans-serif (For UI controls and body text)
- `text-scale-h1`: 3.5rem / 1.1 leading / -0.02em tracking (Display Serif)
- `text-scale-h2`: 2.25rem / 1.2 leading / -0.01em tracking (Display Serif)
- `text-scale-body`: 1rem / 1.6 leading / 0.01em tracking (Interface Sans)
- `text-scale-label`: 0.75rem / 1.0 leading / 0.05em tracking / Uppercase (Interface Sans)

## 4. Spatial System & Grid
Generous whitespace is mandatory to prevent visual clutter.

- `spacing-unit`: 8px
- `container-padding`: 40px (Desktop) / 24px (Mobile)
- `component-gap-large`: 64px (Section breathing room)
- `component-gap-small`: 16px (Internal grouping)
- `grid-columns`: 12-column fluid grid with 32px gutters.

## 5. Object Styles (Framing)
Components should mimic framed art or architectural elements.

- `radius-none`: 0px (Sharp corners for a formal, architectural feel)
- `radius-sm`: 2px (Subtle softening for interactive elements)
- `border-width-thin`: 1px (Hairline strokes only)
- `shadow-gallery-low`: 0 4px 20px rgba(0, 0, 0, 0.04) (Subtle lift)
- `shadow-gallery-high`: 0 12px 40px rgba(0, 0, 0, 0.08) (Floating effect)

## 6. Interaction States
- `state-hover`: Background shifts to `color-bg-canvas` with a 1px `color-text-primary` border.
- `state-active`: 2px scale reduction (98%) to simulate tactile depth.
- `transition-standard`: 300ms cubic-bezier(0.25, 0.1, 0.25, 1) (Smooth, intentional motion).

## 7. UI Generation Constraints
- **Constraint 1**: Maintain a minimum of 20% "empty" space on any given viewport.
- **Constraint 2**: No gradients. All colors must be solid and flat to maintain the gallery aesthetic.
- **Constraint 3**: Use `color-accent-vermillion` for exactly one primary call-to-action per view.
- **Constraint 4**: Imagery must occupy at least 40% of the visual weight in content-heavy layouts.