# Carousel hero: dealer F&I

A landing page hero for Carousel, written for one audience: the finance and insurance (F&I) desk at a car dealership.

## Who it's for, and why

The F&I manager's day is stips: the proof of income, ID and address a lender wants before it funds the deal. Every missing stip is a customer waiting at the desk or a deal that leaves the lot unfunded. Holand Leasing said it on Carousel's own site: "We weren't losing those deals on price. We were losing them to paperwork."

So the hero speaks their language. The headline is "Clear the stips while they *scan their ID*", and the italic phrase rolls through the five checks a dealer actually chases (ID, bank, address, job, credit). One goal: Book a demo. Below the fold, a deal file builds itself as the checks clear, so the promise in the headline is shown, not described.

The look follows oncarousel.com: their type, colours, keycaps, ticker and the 1980s character style. The character is new and generated for this page. She follows your cursor in eight directions and winks when you press anything.

## Run it

Static files, no build step.

```bash
npx serve .
```

Or open `index.html` through any static server. Opening the file directly (`file://`) blocks the ES modules.

## Add a vertical

Everything the hero says lives in `verticals.js`. A new vertical is one new entry: label, tag, headline lead, the five rotating phrases, key labels, subhead, quote, and whether it has a character and a deal card. Then load it with `?v=<slug>`:

- `/` the dealer F&I page (default)
- `/?v=commercial-screening` a second vertical, rendered from the same markup with no character or card yet

An unknown slug falls back to the default. No markup or CSS changes per vertical.

## How it's built

- `index.html` ships complete, readable content with no JavaScript.
- `hero.js` adds the motion: the headline roll, keycaps that hold and press the phrase, the deal card, the gaze and wink, the ticker. Everything respects `prefers-reduced-motion`; with it on, the page shows the finished deal file and no motion.
- The character is one body layer with a hole where the head goes, plus one head image per gaze direction (Carousel builds their hero the same way). The extra heads load on idle, and only for a real mouse on a wide screen. Phones load one head.
- Images come in 1x and 2x, picked by `srcset` and `sizes`.
- `book_demo_click` is pushed to `dataLayer` with the vertical and the phrase on screen, for A/B tests.

## Credits

Reused from oncarousel.com, unchanged: the wordmark, favicon, keycap art and the customer logos in the ticker (details in `assets/carousel/README.md`). Customer names and the three figures (248,317 files, 11 min, 93%) are as Carousel publishes them.

Generated for this page: the character and all her gaze frames (Seedream 5.0 Pro via kie.ai), the approval stamp (GPT Image 2.5). Names, deal numbers and the vehicle in the deal card are fictional. Carousel is a verification platform, not a lender.

## QA and AI log

See `QA.md` and `SUBMISSION.md`.
