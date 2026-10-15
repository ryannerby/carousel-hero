import { VERTICALS, DEFAULT_VERTICAL } from "./verticals.js";

/* index.html ships with the auto-finance content in the markup, so the page reads
   correctly with no JS. This script:
     1. re-renders when ?v=<slug> asks for another vertical
     2. cycles the italic phrase, and lets the keycaps drive it
     3. makes the character follow the cursor (gaze frames, no tilt: she stays static) and wink on any press
     4. loops the ticker
     5. pushes the CTA click to dataLayer */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const params = new URLSearchParams(location.search);
const slug = VERTICALS[params.get("v")] ? params.get("v") : DEFAULT_VERTICAL;
const v = VERTICALS[slug];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. vertical template ---------- */
function render() {
  document.documentElement.dataset.vertical = slug;
  document.title = `${v.lead} while they ${v.rotate[0]} · Carousel for ${v.tag.replace(/^For /, "")}`;
  $("[data-slot=nav-vertical]").textContent = v.label;
  $("[data-slot=tag]").textContent = v.tag;
  $("[data-slot=lead]").textContent = v.lead;
  $("[data-slot=rotor]").replaceChildren(...v.rotate.map((t, i) => {
    const em = document.createElement("em");
    em.textContent = t;
    if (i === 0) em.className = "is-on";
    return em;
  }));
  $("[data-slot=rotor-said]").textContent = v.rotate.slice(0, -1).join(", ") + " and " + v.rotate.at(-1);
  $$(".key .key-label").forEach((el, i) => { el.textContent = v.keys[i]; });
  $("[data-slot=sub]").textContent = v.sub;
  $("[data-slot=cta]").href = v.cta.href;
  $("[data-slot=cta]").firstChild.textContent = v.cta.label + " ";
  Object.assign($("[data-slot=secondary]"), { href: v.secondary.href, textContent: v.secondary.label });
  $("[data-slot=quote]").textContent = `“${v.quote.text}”`;
  $("[data-slot=quote-who]").textContent = v.quote.who;
  if (!v.character) document.documentElement.classList.add("no-image");
  if (!v.deal) document.documentElement.classList.add("no-deal");
}
if (slug !== DEFAULT_VERTICAL) render();

/* ---------- 2. rotating phrase + keycaps ---------- */
const rotor = $(".rotor"); // the underline lives here; the phrases live in [data-slot=rotor] (the clip)
const phrases = $$("[data-slot=rotor] em");
// underline starts at the first phrase's width (fonts can change widths once loaded)
const fitLine = () => rotor.style.setProperty("--uw", phrases[current].offsetWidth + "px");
document.fonts?.ready.then(fitLine); addEventListener("resize", fitLine);
const keys = $$(".key");
let current = 0, timer = 0, held = false;

const outTimers = new Map();
function show(i) {
  keys.forEach((k, n) => k.setAttribute("aria-pressed", String(n === i)));
  if (i === current) return;
  const prev = phrases[current], next = phrases[i];
  // old phrase rolls up and out, then parks below again (instantly, while clipped)
  prev.classList.remove("is-on");
  prev.classList.add("is-out");
  clearTimeout(outTimers.get(prev));
  outTimers.set(prev, setTimeout(() => prev.classList.remove("is-out"), 300));
  // new phrase: make sure it starts from the parked position below, then roll it in
  clearTimeout(outTimers.get(next));
  next.classList.remove("is-out");
  void next.offsetWidth;
  next.classList.add("is-on");
  current = i;
  rotor.style.setProperty("--uw", next.offsetWidth + "px");
  keys.forEach((k, n) => k.setAttribute("aria-pressed", String(n === current)));
}
/* The deal card follows the same step counter as the headline: keys before the current step have
   a green light and a "Verified" row, the current key is pressed and its row reads "In progress".
   After the last step the file completes: every light green, status Decision-ready, the stamp
   drops and leaves a blue check, then the cycle starts over on a fresh file. */
const deal = $(".deal");
const rows = $$(".rc-rows li");
const status = $("[data-slot=status] span");
const fileStatus = $("[data-slot=file-status]");
const bar = $("[data-slot=progress]");
let done = false;

function paintCard(step, complete) {
  done = complete;
  keys.forEach((k, n) => k.classList.toggle("is-done", complete || n < step));
  rows.forEach((r, n) => {
    const v = r.querySelector(".r-val");
    const isDone = complete || n < step, isNow = !complete && n === step;
    r.classList.toggle("is-done", isDone);
    r.classList.toggle("is-now", isNow);
    v.textContent = isDone ? v.dataset.pending : isNow ? "In progress" : "Waiting";
  });
  bar?.style.setProperty("--p", (complete ? 100 : step / keys.length * 100) + "%");
  deal?.classList.toggle("is-done", complete);
  if (status) status.textContent = complete ? "Decision-ready" : "In progress";
  if (fileStatus) fileStatus.textContent = complete ? "Sent to lender" : "Building";
}

function complete() {
  paintCard(keys.length, true);
  keys.forEach(k => k.setAttribute("aria-pressed", "false"));
  if (!reduceMotion && deal) {
    deal.classList.remove("is-stamping"); void deal.offsetWidth; deal.classList.add("is-stamping");
  }
}

// One tick of the auto cycle: step 0..4, then a "complete" beat, then a fresh file.
function tick() {
  if (done) { deal?.classList.remove("is-stamping"); show(0); paintCard(0, false); return; }
  if (current === keys.length - 1) { complete(); return; }
  show(current + 1); paintCard(current, false);
}
function start() {
  if (reduceMotion || timer || held) return;
  timer = setInterval(tick, 2600);
}
function stop() { clearInterval(timer); timer = 0; }

keys.forEach((k, i) => {
  // Hover or focus holds the cycle on that key's step (Carousel's hero chips do the same).
  const hold = () => { held = true; stop(); show(i); paintCard(i, false); };
  const release = () => { held = false; start(); };
  k.addEventListener("mouseenter", hold);
  k.addEventListener("focus", hold);
  k.addEventListener("mouseleave", release);
  k.addEventListener("blur", release);
  k.addEventListener("click", () => { show(i); paintCard(i, false); });
});

if (reduceMotion) complete(); // no motion: show the finished file, which says the most at a glance
else paintCard(0, false);
start();

// The card lives below the fold: when it scrolls into view, start the file over from step 1
// so the visitor always watches the whole thing build.
if (deal && !reduceMotion && "IntersectionObserver" in window) {
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || held) return;
    stop(); deal.classList.remove("is-stamping"); show(0); paintCard(0, false); start();
  }, { threshold: 0.5 }).observe(deal);
}

/* ---------- 3. character: gaze + wink ---------- */
// Each head comes in 1x (1200px figure) and 2x (full 2352px) so her face stays sharp on retina screens,
// as Carousel serves their hero in several densities.
function setHead(img, name) {
  img.srcset = `assets/lady/head-${name}.webp 1x, assets/lady/2x/head-${name}.webp 2x`;
  img.src = `assets/lady/head-${name}.webp`;
}
const lady = $("[data-slot=lady]");
const heads = Object.fromEntries($$(".lady-head img").map(img => [img.dataset.gaze, img]));
let gaze = "centre", winking = false;

function look(name) {
  if (winking || name === gaze) return;
  const img = heads[name];
  if (!img || !img.complete || !img.naturalWidth) name = "centre"; // never show a half-loaded head
  heads[gaze].classList.remove("is-on");
  heads[name].classList.add("is-on");
  gaze = name;
}


// Tracking only where it makes sense: a real mouse, room for the figure, motion allowed.
// Phones keep the resting frame and never download the extra heads (as Carousel's does).
const canTrack = lady && !reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth >= 860;

if (canTrack) {
  // Load the other heads only once the page is idle, so they never compete with first paint.
  const loadHeads = () => Object.entries(heads).forEach(([name, img]) => {
    if (name !== "centre" && !img.src) setHead(img, name);
  });
  addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(loadHeads) : setTimeout(loadHeads, 300)));

  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (!inView) look("centre"); }, { threshold: 0.15 })
    .observe(lady);

  // No tilt: Ryan wanted her (and the pile, which is the same photo) static. Only the head frame changes.

  // Eight directions, by the angle from her face to the cursor. Frames G1/G2/G4 were named in
  // the GENERATED image's terms and the page mirrors her, so on screen: G2 = left, G1 = right,
  // G4 = up-left. UR / D / DL / DR were named in screen terms when they were prompted.
  const SECTORS = ["G1", "DR", "D", "DL", "G2", "G4", "G4", "UR"]; // 0deg = right, clockwise (screen y grows down)
  function zone(px, py) {
    if (Math.hypot(px, py) < 70) return "centre"; // cursor on her face: she looks at you
    const a = (Math.atan2(py, px) * 180 / Math.PI + 360 + 22.5) % 360;
    return SECTORS[Math.floor(a / 45)];
  }

  addEventListener("pointermove", e => {
    if (!inView || e.pointerType !== "mouse") return;
    const r = lady.querySelector(".lady-head").getBoundingClientRect();
    const fx = r.left + r.width * 0.506, fy = r.top + r.height * 0.267; // her face within the taller head box
    const px = e.clientX - fx, py = e.clientY - fy;
    look(zone(px, py));
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    look("centre");
  });

}

/* Wink on ANY press: a click anywhere, Book a demo, a key. pointerdown fires before a link
   navigates, so she winks as you hit the CTA. Works on phones too: the wink head is fetched
   on every device (one ~25 KB file), only the gaze heads are desktop-only. No bounce. */
if (lady && !reduceMotion) {
  const wink = heads.WINK;
  const fetchWink = () => { if (!wink.src) setHead(wink, "WINK"); };
  addEventListener("load", () => setTimeout(fetchWink, 200));
  let winkT = 0;
  addEventListener("pointerdown", () => {
    if (!wink.naturalWidth) return;
    winking = false; look("WINK"); winking = true;
    clearTimeout(winkT);
    winkT = setTimeout(() => { winking = false; look("centre"); }, 1100);
  }, { passive: true });
}

/* ---------- 4. ticker ---------- */
if (!reduceMotion) {
  const track = $("[data-slot=ticker]");
  track.append(...[...track.children].map(li => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); return c; }));
  track.classList.add("is-looping");
}

/* ---------- 5. analytics hook ----------
   The click is the leading indicator; the event that proves a headline variant
   worked is the demo actually booked on /book-a-demo. */
$("[data-slot=cta]")?.addEventListener("click", () => {
  (window.dataLayer = window.dataLayer || []).push({
    event: "book_demo_click",
    vertical: slug,
    phrase_shown: phrases[current]?.textContent,
  });
});
