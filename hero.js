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
}
if (slug !== DEFAULT_VERTICAL) render();

/* ---------- 2. rotating phrase + keycaps ---------- */
const phrases = $$("[data-slot=rotor] em");
const keys = $$(".key");
let current = 0, timer = 0, held = false;

function show(i) {
  phrases[current].classList.remove("is-on");
  current = i;
  phrases[current].classList.add("is-on");
  keys.forEach((k, n) => k.setAttribute("aria-pressed", String(n === current)));
}
function start() {
  if (reduceMotion || timer || held) return;
  timer = setInterval(() => show((current + 1) % phrases.length), 2600);
}
function stop() { clearInterval(timer); timer = 0; }

keys.forEach((k, i) => {
  // Hover or focus holds the cycle on that key's phrase (Carousel's hero chips do the same).
  const hold = () => { held = true; stop(); show(i); };
  const release = () => { held = false; start(); };
  k.addEventListener("mouseenter", hold);
  k.addEventListener("focus", hold);
  k.addEventListener("mouseleave", release);
  k.addEventListener("blur", release);
  k.addEventListener("click", () => { show(i); poke(); });
});
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

  // Floating props: depth parallax, after Carousel's .fz-float (offset up to 30px x / 24px y, x depth).
  const props = $$(".prop");
  addEventListener("pointermove", e => {
    if (!inView || e.pointerType !== "mouse") return;
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    props.forEach(p => {
      const d = +p.dataset.depth || 1;
      p.style.setProperty("--mx", (-nx * 30 * d).toFixed(1) + "px");
      p.style.setProperty("--my", (-ny * 24 * d).toFixed(1) + "px");
    });
  }, { passive: true });

  document.documentElement.addEventListener("mouseleave", () => {
    look("centre"); aim(0, 0);
    props.forEach(p => { p.style.removeProperty("--mx"); p.style.removeProperty("--my"); });
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
