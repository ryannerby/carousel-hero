/* One object per vertical. The hero reads everything from here.
   Adding a vertical = adding an entry. No markup or CSS changes.
   Stats are figures published on oncarousel.com. The character is generated
   and fictional. */

export const VERTICALS = {
  "auto-finance": {
    label: "Auto finance",
    tag: "For dealer F&I",
    lead: "Clear the stips",
    rotate: ["scan their ID", "connect their bank", "sign the consent"],
    keys: ["ID", "Bank", "Credit"], // one keycap per phrase, same order
    sub: "Your buyer verifies ID, income and credit on their own phone, right at your desk. You send the lender one decision-ready file before they leave the lot.",
    cta: { label: "Book a demo", href: "https://oncarousel.com/book-a-demo/" },
    secondary: { label: "See a sample report", href: "https://oncarousel.com/assets/sample/screening-report-example.pdf" },
    quote: {
      text: "We weren’t losing those deals on price. We were losing them to paperwork.",
      who: "F&I, Holand Leasing",
    },
    character: true, // layered figure in assets/lady/ (body + gaze heads)
  },

  "commercial-screening": {
    label: "Commercial leasing",
    tag: "For credit desks",
    lead: "Approve the tenant",
    rotate: ["scan their ID", "connect the business bank", "consent to credit"],
    keys: ["ID", "Bank", "Credit"],
    sub: "The applicant proves who they are and what the business earns from their phone, in one sitting. Your credit desk reads one report instead of chasing statements.",
    cta: { label: "Book a demo", href: "https://oncarousel.com/book-a-demo/" },
    secondary: { label: "See a sample report", href: "https://oncarousel.com/assets/sample/screening-report-example.pdf" },
    quote: {
      text: "Screening was the one thing that never lived where we actually work.",
      who: "Operations, Unity Leases",
    },
    character: false, // no character generated for this vertical yet; the layout hides the column
  },
};

export const DEFAULT_VERTICAL = "auto-finance";

/* Published on oncarousel.com, shared by every vertical. */
export const TICKER = [
  "248,317 files processed",
  "11 min median to a decision-ready file",
  "93% of applicants finish",
];
