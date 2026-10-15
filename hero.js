import { VERTICALS, DEFAULT_VERTICAL } from "./verticals.js";

/* index.html ships with the auto-finance content already in the markup, so the page
   reads correctly with no JS. This script (1) re-renders when ?v=<slug> asks for
   another vertical, (2) cycles the italic phrase, (3) loops the ticker, (4) pushes
   the CTA click to dataLayer. */

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.search);
const slug = VERTICALS[params.get("v")] ? params.get("v") : DEFAULT_VERTICAL;
const v = VERTICALS[slug];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  $("[data-slot=rotor-said]").textContent =
    v.rotate.slice(0, -1).join(", ") + " and " + v.rotate.at(-1);
  $("[data-slot=sub]").textContent = v.sub;
  Object.assign($("[data-slot=cta]"), { href: v.cta.href });
  $("[data-slot=cta]").firstChild.textContent = v.cta.label + " ";
  Object.assign($("[data-slot=secondary]"), { href: v.secondary.href, textContent: v.secondary.label });
  $("[data-slot=quote]").textContent = `“${v.quote.text}”`;
  $("[data-slot=quote-who]").textContent = v.quote.who;

  const img = $("[data-slot=image]");
  if (v.image) {
    Object.assign(img, { src: v.image.src, srcset: v.image.srcset, alt: v.image.alt });
  } else {
    document.documentElement.classList.add("no-image");
  }
}

if (slug !== DEFAULT_VERTICAL) render();

/* Cycle the italic phrase. Static under reduced motion (first phrase stays). */
if (!reduceMotion) {
  const items = [...document.querySelectorAll("[data-slot=rotor] em")];
  let i = 0;
  setInterval(() => {
    items[i].classList.remove("is-on");
    i = (i + 1) % items.length;
    items[i].classList.add("is-on");
  }, 2600);

  /* Ticker: duplicate the list once so a -50% translate loops seamlessly. */
  const track = $("[data-slot=ticker]");
  track.append(...[...track.children].map(li => li.cloneNode(true)));
  track.querySelectorAll("li:nth-child(n+4)").forEach(li => li.setAttribute("aria-hidden", "true"));
  track.classList.add("is-looping");
}

/* Analytics hook. The click is the leading indicator; the event that proves a
   headline variant worked is the demo actually booked on /book-a-demo. */
$("[data-slot=cta]")?.addEventListener("click", () => {
  (window.dataLayer = window.dataLayer || []).push({
    event: "book_demo_click",
    vertical: slug,
    headline: `${v.lead} while they …`,
  });
});
