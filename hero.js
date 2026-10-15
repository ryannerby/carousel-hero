import { VERTICALS, DEFAULT_VERTICAL } from "./verticals.js";

/* index.html ships with the auto-finance content in the markup, so the page reads
   correctly with no JS. This script:
     1. re-renders when ?v=<slug> asks for another vertical
     2. cycles the italic phrase, and lets the keycaps drive it
     3. makes the character follow the cursor (gaze frames + 3D tilt) and wink on click
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
  document.title = `${v.lead} while they ${v.rotate[1]} · Carousel`;
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
  k.addEventListener("click", () => { show(i); paintCard(i, false); poke(); });
});

if (reduceMotion) complete(); // no motion: show the finished file, which says the most at a glance
else paintCard(0, false);
start();

/* ---------- 3. character: gaze + tilt + wink ---------- */
const lady = $("[data-slot=lady]");
const tilt = lady?.querySelector(".lady-tilt");
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

function poke() {
  if (!lady || reduceMotion) return;
  lady.classList.remove("is-poke");
  void lady.offsetWidth; // restart the animation
  lady.classList.add("is-poke");
}

// Tracking only where it makes sense: a real mouse, room for the figure, motion allowed.
// Phones keep the resting frame and never download the extra heads (as Carousel's does).
const canTrack = lady && !reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches && innerWidth >= 860;

if (canTrack) {
  // Load the other heads only once the page is idle, so they never compete with first paint.
  const loadHeads = () => Object.entries(heads).forEach(([name, img]) => {
    if (name !== "centre" && !img.src) img.src = `assets/lady/head-${name}.webp`;
  });
  addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(loadHeads) : setTimeout(loadHeads, 300)));

  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (!inView) { look("centre"); aim(0, 0); } }, { threshold: 0.15 })
    .observe(lady);

  // Continuous tilt, eased every frame toward a target, so the hard head swaps read as one motion.
  let rx = 0, ry = 0, trx = 0, try_ = 0, raf = 0;
  function aim(x, y) { trx = x; try_ = y; if (!raf) raf = requestAnimationFrame(step); }
  function step() {
    rx += (trx - rx) * 0.09;
    ry += (try_ - ry) * 0.09;
    tilt.style.setProperty("--rx", rx.toFixed(2) + "deg");
    tilt.style.setProperty("--ry", ry.toFixed(2) + "deg");
    raf = Math.abs(trx - rx) + Math.abs(try_ - ry) > 0.02 ? requestAnimationFrame(step) : 0;
  }

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
    const fx = r.left + r.width * 0.64, fy = r.top + r.height * 0.28; // her face within the taller head box
    const px = e.clientX - fx, py = e.clientY - fy;
    const dx = px / innerWidth, dy = py / innerHeight;
    look(zone(px, py));
    aim(Math.max(-4, Math.min(4, -dy * 10)), Math.max(-7, Math.min(7, dx * 16)));
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    look("centre"); aim(0, 0);
  });

  // Click on the hero (not on a link or button) and she winks.
  $(".hero").addEventListener("click", e => {
    if (e.target.closest("a, button") || !heads.WINK.naturalWidth) return;
    look("WINK");
    winking = true;
    poke(); // the bounce makes the click read even when her face is small on screen
    setTimeout(() => { winking = false; look("centre"); }, 1300);
  });
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
