# Brand assets

Derived from the designer's delivery in `docs/assets/img/`. **Those originals are
never edited** — they are the source of truth for what was handed over. This
folder holds the versions the application actually serves.

| File                | Use                                   | Origin                                      |
| ------------------- | ------------------------------------- | ------------------------------------------- |
| `logo-on-dark.svg`  | Full lockup over Ink surfaces         | `logo-clasificados-colombia-main.svg`       |
| `logo-on-light.svg` | Full lockup over Paper/white surfaces | `logo-clasificados-colombia-main-black.svg` |
| `logomark.svg`      | Circular "C" mark — favicon, avatars  | `favicon.svg`                               |

The favicon is additionally placed at `src/app/icon.svg` so Next's metadata
convention emits the `<link rel="icon">` automatically.

---

## Correction applied to both lockups

**Defect:** 12 of the 22 `<path>` elements in each original carry no `class`
attribute. Those 12 are the letters of the CLASIFICADOS wordmark. With no class
and no `fill`, SVG falls back to its default `fill: black`.

On the light variant this happens to look right, so the defect is invisible
there. On the dark variant it is not: the wordmark renders black on Ink and
disappears. Only the "C" monogram and the red COLOMBIA line survive.

**Fix:** a single `fill` presentation attribute on the root `<svg>`:

```diff
- <svg ... viewBox="0 0 480.18 107.6">
+ <svg ... viewBox="0 0 480.18 107.6" fill="#f2f2f2">
```

The unclassed paths inherit it; the classed ones are unaffected, because a CSS
declaration (`.cls-1 { fill: … }`) beats an inherited value. Nothing else in the
geometry changed.

`logo-on-light.svg` received the same treatment with `#000a0a`, which also
replaces the accidental pure `#000000` with the actual brand near-black.

This is a workaround, not a resolution. **The upstream files should be fixed at
source** so the next export does not reintroduce it.

---

## Palette mismatch — RESOLVED: the PRD wins

The delivered SVGs did not use the palette approved in PRD Master §4. Decision
taken 2026-08-17: **PRD Master §4 is authoritative**, and these served copies
were recoloured to match.

| Role              | PRD Master §4 (applied) | As delivered | Action               |
| ----------------- | ----------------------- | ------------ | -------------------- |
| Investigation Red | `#D71920`               | `#d71920`    | case normalised only |
| Ink               | `#0A0A0A`               | `#000a0a`    | recoloured           |
| Paper             | `#F7F6F2`               | `#f2f2f2`    | recoloured           |

`#000a0a` versus `#0A0A0A` looked like transposed digits, but it was a real
difference — a slight cyan cast rather than neutral black.

`#f2f2f2` versus `#F7F6F2` mattered more: PRD Master §4 explicitly asks to
"evitar blanco digital excesivamente frío", and `#f2f2f2` is exactly that — a
cold neutral grey, where Paper is warm. Keeping it would have put the logo in
open contradiction with its own stated palette intent.

The originals in `docs/assets/img/` are untouched and still carry the delivered
values. **The upstream source files should be recoloured too**, alongside the
wordmark fix above — otherwise the next export reintroduces both problems.

---

## Missing variants

PRD Nº8 §24 asks for `Logo`, `LogoMark`, `Wordmark` and `BrandLockup`, in
`dark` / `light` / `compact` variants. Delivered so far:

- ✅ Full lockup, dark and light
- ✅ LogoMark (the circular "C")
- ❌ **Compact variant** — needed for the scrolled/condensed header state
  (PRD Nº8 §26, and the reference sheet shows a compact mark on mobile)
- ❌ **Standalone wordmark** without the monogram
- ❌ **`apple-touch-icon` PNG** — Safari on iOS ignores SVG favicons

None of these block F1, but the compact variant blocks the header work in F8.
