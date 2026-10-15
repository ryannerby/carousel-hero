# QA

Live: https://carousel-hero-nu.vercel.app
Checked 2026-10-15. Headless Chrome 155 drove every check below and read the results from the DOM, not from screenshots alone.

## Lighthouse (live site, two runs each)

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | 100, 100 | 100 | 100 | 100 |
| Mobile (simulated slow 4G) | 92, 95 | 100 | 100 | 100 |

Desktop: first paint 0.3s, largest paint 0.6s. Mobile: first paint 1.0s, largest paint 2.9s. Layout shift 0 on both.

What moved the numbers:
- Gold laurel text was 3.2:1 on cream. Darkened to Carousel's own dark foil stop (#8A6B24), 4.7:1. Accessibility 96 to 100.
- Phones were downloading the 2x figure. Switched to width-based `srcset` + `sizes`; phones get the 1x file.
- Keycap PNGs were 151px wide, shown at about 54px. Now 112px WebP with width and height set.
- Google Fonts made the browser fetch a stylesheet, then the fonts, before drawing text. Self-hosted the Latin subsets with preloads, as oncarousel.com does. Mobile first paint 3.4s to 1.0s, performance 81 to 92-95.

## Layout (18 viewports)

1920x1080, 1680x1050, 1536x864, 1440x900, 1366x768, 1280x800, 1280x720, 1100x800, 1024x700, 1004x560, 900x900, 860x900, 820x1180, 768x1024, 600x900, 430x932, 390x844, 360x740.

At every size: no horizontal scroll, text never runs past the hero, Book a demo above the fold, no console errors. From 860px up, the LIVE ticker sits on the fold line. Below 860px the hero stacks and centres: copy, then the character, then the ticker. Windows under 740px tall drop the quote first and keep the CTA.

## Interaction

- Gaze: pointer swept around her face at 8 angles; each picks the right head frame. Cursor on her face: she looks at you.
- Wink: pressing anywhere, including Book a demo and the keys, shows the wink for about a second, on mouse and touch.
- Headline: the phrase rolls one at a time with no overlap. Fast hovers across all five keys end with exactly one phrase visible.
- Deal card: steps advance every 2.6s, complete with the stamp at about 13s, restart when scrolled into view.

## Keyboard

Tab order: logo, Auto finance, Book a demo (nav), Book a demo (hero), See a sample report, Book a demo (card band), then the five keys. Every stop shows a focus ring. Focusing a key shows its step in the headline and the card.

## Reduced motion (`prefers-reduced-motion: reduce`)

Headline stays on the first phrase. Deal card shows the finished file ("Sent to lender"). Ticker does not scroll. The character does not rise in, and the gaze heads never download.

## Templating

`/?v=commercial-screening` renders the second vertical from the same markup (headline, five keys, subhead, quote, title) with no character and no card. An unknown slug falls back to the dealer page.

## Real device

Pending: iPhone check on the live link.

## Known issues, not fixed

- Her face is softer and less retouched than Carousel's hero. Matching that finish means regenerating her and her nine gaze frames; I chose to ship this one.
- Lighthouse still lists unminified CSS/JS (a few KB, served compressed by Vercel) and "properly size images" on the 2x figure for very large screens.
- The second vertical has copy but no character or card yet.
