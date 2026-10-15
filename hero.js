import { VERTICALS, DEFAULT_VERTICAL, STATS } from "./verticals.js";

/* index.html ships with the auto-finance content already in the markup, so the
   page reads correctly with no JS at all. This script only re-renders when
   ?v=<slug> asks for another vertical, and wires the CTA analytics event. */

const params = new URLSearchParams(location.search);
const slug = VERTICALS[params.get("v")] ? params.get("v") : DEFAULT_VERTICAL;
const v = VERTICALS[slug];

function set(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function render() {
  document.documentElement.dataset.vertical = slug;
  document.title = `${v.headline} · Carousel`;
  set("[data-slot=nav-vertical]", v.label);
  set("[data-slot=eyebrow]", v.eyebrow);
  set("[data-slot=headline]", v.headline);
  set("[data-slot=sub]", v.sub);
  set("[data-slot=quote]", `“${v.quote.text}”`);
  set("[data-slot=quote-who]", v.quote.who);

  const cta = document.querySelector("[data-slot=cta]");
  cta.textContent = v.cta.label;
  cta.href = v.cta.href;
  const sec = document.querySelector("[data-slot=secondary]");
  sec.textContent = v.secondary.label;
  sec.href = v.secondary.href;

  set("[data-slot=mock-title]", v.mock.title);
  set("[data-slot=mock-meta]", v.mock.meta);
  set("[data-slot=mock-person]", v.mock.person);
  set("[data-slot=mock-initials]", v.mock.initials);

  const list = document.querySelector("[data-slot=checks]");
  list.innerHTML = "";
  for (const c of v.mock.checks) {
    const li = document.createElement("li");
    li.className = `check is-${c.state}`;
    li.innerHTML = `<span class="check-mark" aria-hidden="true"></span>
      <span class="check-text"><strong>${c.name}</strong><small>${c.detail}</small></span>
      <span class="check-state">${{ done: "Done", now: "Now", next: "Next" }[c.state]}</span>`;
    list.appendChild(li);
  }

  const stats = document.querySelector("[data-slot=stats]");
  stats.innerHTML = STATS.map(s => `<li><b>${s.value}</b> ${s.label}</li>`).join("");
}

if (slug !== DEFAULT_VERTICAL) render();

/* Analytics hook. The click is the leading indicator; the event that proves a
   headline variant worked is the demo actually booked on /book-a-demo. */
document.querySelector("[data-slot=cta]")?.addEventListener("click", () => {
  (window.dataLayer = window.dataLayer || []).push({
    event: "book_demo_click",
    vertical: slug,
    headline: v.headline,
  });
});
