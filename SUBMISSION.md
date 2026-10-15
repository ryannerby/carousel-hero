# Submission: Assignment 1, landing page hero

**Live:** https://carousel-hero-nu.vercel.app
**Code:** https://github.com/ryannerby/carousel-hero
**Ryan Nerby**, ryan@sylven.co

## Who it's for, and why

This hero is for the F&I (finance and insurance) desk at a car dealership. That desk lives on stips: the proof of income, ID and address a lender wants before it funds the deal. Every missing stip is a buyer waiting at the desk, or a deal that drives off unfunded. Holand Leasing put it on Carousel's own site: "We weren't losing those deals on price. We were losing them to paperwork." So the headline speaks their language: "Clear the stips while they *scan their ID*". The italic phrase rolls through the five stips a dealer actually chases (ID, bank, address, job, credit), and the subhead names the deadline that matters to them: one decision-ready file before the buyer leaves the lot. One goal on the page: Book a demo.

It's built to look like it came from oncarousel.com: their type and colours, their keycaps and LIVE ticker, the italic accent word, and their 1980s character style. The character is new and generated for this page. She follows your cursor in eight directions and winks when you press anything. Below the fold, a deal file builds itself as the checks clear, so the promise in the headline is shown, not described. The whole hero renders from one config entry, so the next vertical is a data change, not a rebuild (`/?v=commercial-screening` shows a second one).

## AI log

Tools: Claude Code (Anthropic) for the build, the brand study and every check, with a headless Chrome it drove to read Carousel's live site; Seedream 5.0 Pro (via kie.ai) for the character and her gaze frames; GPT Image 2.5 for the approval stamp; Apple's on-device Vision model for cut-outs. Image spend: $3.43, logged per call against a $5 cap I set before starting.

- **Brand study before building.** Claude Code rendered oncarousel.com at 1440px, read the computed CSS of every signature effect (the extruded headline shadows, the gold foil gradient, the keycap press), and read their shipped JavaScript to see how the hero's cursor-following works. The build copies their values, not my guesses.
- **Where the AI was wrong, 1: it called the first version on-brand because it used Carousel's colour tokens.** Every automated check passed. Next to the real site it was a generic hero in their colours. I caught it by comparing side by side, and the study above was the fix. Lesson: fit is a separate test from quality.
- **Key prompt 1, the character (Seedream, image-to-image from my earlier take):** "Keep this exact woman exactly as she is: the same face, hair, gold hoop earrings, electric blue power suit... Change only what she sits on and widen the camera: replace the single tall stack of folders with a broad, low mound of the same manila file folders and loose white paper... No other objects, no people, no writing, no labels, no numbers."
- **Key prompt 2, the gaze frames:** one paragraph naming everything that must not move, then a single change: "Her head stays upright and does not turn or tilt; only her eyes and eyelids move." Eight directions plus a wink. Upward looks first came back startled; re-prompted with "a relaxed, knowing half-smile... eyebrows stay level... amused and unbothered, never surprised."
- **Where the AI was wrong, 2: text leaks.** "No readable text" didn't stop the first stills from printing half-legible contract headings. Describing every paper as "blank" did.
- **Where the AI was wrong, 3: it fixed visual problems by eye.** A seam where the head layer meets the body was "fixed" twice from small screenshots and was still visible. The third time it built a checker that scores every gaze frame for ghosting and shading steps, found the seam was worst on two specific looks, switched to multi-band blending and re-rolled one frame. All nine looks now measure at the noise floor.
- **Where the AI was wrong, 4: a colour grade to make her face "pop" turned her orange.** Reverted. It kept the half that helped: a 2x image set, because the 1x image was being stretched on retina screens.
- **Measure, don't assume.** The cut-out dropped her folder pile, which only showed up by measuring transparency by region. Gold buttons painted at fixed coordinates sat beside the real buttons in some frames, because her arm moves up to 85px between renders; each button is now located per frame. The AI also wrote invented timestamps into its own log once; every number in the log now comes from a tool.
- **Honest time:** about four and a half hours of working time, well over the 45 to 60 minutes. Most of it went into the character and the gaze effect.

## QA note

Full detail in [QA.md](QA.md).

- **Lighthouse on the live site:** desktop 100 / 100 / 100 / 100. Mobile 92 to 95 / 100 / 100 / 100. Layout shift 0.
- **18 viewports**, 360 to 1920 wide: no horizontal scroll, text never runs past the hero, Book a demo above the fold, no console errors. On desktop the LIVE ticker sits on the fold line.
- **Real device:** iPhone, Safari. One fix came from it: the deal card's status pill was squeezing the buyer's name onto two lines.
- **Keyboard:** every control reachable with a visible focus ring. **Reduced motion:** nothing animates; the card shows the finished file.
- **Known issues, not fixed:** her face is softer than Carousel's retouched hero (matching it means regenerating her and nine frames); the second vertical has copy but no character yet.

## Credits

Carousel's own wordmark, favicon, keycap art and customer logos are reused unchanged, so the components match the design system; customer names and figures are as Carousel publishes them. The character, her gaze frames and the stamp are generated for this page. Names, deal numbers and the vehicle in the deal card are fictional. Carousel is a verification platform, not a lender.
