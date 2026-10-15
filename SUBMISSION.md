# Submission: Assignment 1, landing page hero

**Live:** https://carousel-hero-nu.vercel.app
**Code:** https://github.com/ryannerby/carousel-hero
**Ryan Nerby**, ryan@sylven.co

## Who it's for, and why

This hero is for the F&I (finance and insurance) desk at a car dealership. That desk lives on stips: the proof of income, ID and address a lender wants before it funds the deal. Every missing stip is a buyer waiting at the desk, or a deal that drives off unfunded. Holand Leasing says it on your site: "We weren't losing those deals on price. We were losing them to paperwork."

So the headline speaks their language: "Clear the stips while they *scan their ID*". The italic phrase rolls through the five stips a dealer chases (ID, bank, address, job, credit), and the subhead names the deadline that matters to them: one decision-ready file before the buyer leaves the lot. There is one goal on the page: Book a demo.

It's built to sit on oncarousel.com: your type, colours, keycaps and LIVE ticker, the italic accent word, and the 1980s character style. The character is new, generated for this page. She follows the cursor in eight directions and winks on any click. Below the fold, a deal file builds itself as the checks clear, so the headline's promise is shown rather than described. The hero renders from one config entry per vertical, so the next one is a copy change, not a rebuild (`/?v=commercial-screening` shows a second).

## AI log

**Tools:** Claude Code for the build, the brand study and every check, driving a headless Chrome to read your live site; Seedream 5.0 Pro (via kie.ai) for the character and her gaze frames; GPT Image 2.5 for the approval stamp; Apple's on-device Vision model for cut-outs. Image generation cost $3.43 in total, logged per call.

- **Brand study before building.** Claude Code rendered your site at desktop size, read the CSS behind each signature effect (the extruded headline shadows, the gold foil, the keycap press) and read your shipped JavaScript to see how your hero follows the cursor. The page uses your values, not guesses.
- **Where the AI was wrong (1): it called the first version on-brand because it used your colour palette.** Every automated check passed. Side by side with your site, it was a generic hero in your colours. Comparing the two is how I caught it, and the study above was the fix. The lesson: fit is a separate test from quality.
- **Key prompt (1), the character** (Seedream, image-to-image from an earlier take): "Keep this exact woman exactly as she is: the same face, hair, gold hoop earrings, electric blue power suit... Change only what she sits on and widen the camera: replace the single tall stack of folders with a broad, low mound of the same manila file folders and loose white paper... No other objects, no people, no writing, no labels, no numbers."
- **Key prompt (2), the gaze frames:** one paragraph naming everything that must not move, then a single change: "Her head stays upright and does not turn or tilt; only her eyes and eyelids move." That gives eight directions plus a wink. The upward looks first came back startled, so I re-prompted with "a relaxed, knowing half-smile... eyebrows stay level... amused and unbothered, never surprised."
- **Where the AI was wrong (2): text in the images.** "No readable text" didn't stop the first stills printing half-legible contract headings. Describing every sheet of paper as "blank" did.
- **Where the AI was wrong (3): it judged visual fixes by eye.** A seam where her head layer meets her body was "fixed" twice from small screenshots and was still visible. The third time it built a checker that scores every gaze frame for ghosting and shading steps. The checker found the seam was worst on two specific looks; switching to multi-band blending and re-generating one frame fixed it. All nine looks now measure at the noise floor.
- **Where the AI was wrong (4): a colour grade meant to make her face pop turned her orange.** I reverted the grade and kept the part that helped: a 2x image set, because the 1x image was being stretched on retina screens.
- **Measure, don't assume.** The cut-out tool dropped her folder pile, which only showed up when transparency was measured region by region. Gold buttons painted at fixed positions landed beside the real buttons in some frames, because her arm moves up to 85px between renders, so each button is now located frame by frame. The AI also once wrote invented timestamps into its own log; every number in the log now comes from a tool.
- **Time:** about four and a half hours, past your 45 to 60 minute guide, and that was a choice. The page structure and copy are the hour-sized part. The rest went into the character and her gaze effect, because on your site the character is what makes the page.

## QA note

Full detail is in [QA.md](QA.md).

- **Lighthouse, live site:** desktop 100 / 100 / 100 / 100; mobile 92 to 95 / 100 / 100 / 100; no layout shift.
- **18 screen sizes, 360 to 1920 wide:** no sideways scroll, text stays inside the hero, Book a demo above the fold, no console errors. On desktop the LIVE ticker sits on the fold line.
- **Real device (iPhone, Safari):** one fix came from it. The deal card's status pill was squeezing the buyer's name onto two lines.
- **Keyboard:** every control is reachable with a visible focus ring. **Reduced motion:** nothing animates, and the card shows the finished file.
- **Known issues, not fixed:** her face is softer than your hero's retouched finish (matching it means regenerating her and nine frames), and the second vertical has copy but no character yet.

## Credits

Your wordmark, favicon, keycap art and customer logos are reused unchanged, so the components match your design system. Customer names and figures are as you publish them. The character, her gaze frames and the stamp were generated for this page. Names, deal numbers and the vehicle in the deal card are fictional. Carousel is a verification platform, not a lender.
