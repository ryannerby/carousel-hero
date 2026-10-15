/* One object per vertical. The hero reads everything from here.
   Adding a vertical = adding an entry. No markup or CSS changes.
   Stats are the figures published on oncarousel.com; nothing here is invented
   except the applicant names and deal numbers in the phone mock. */

export const VERTICALS = {
  "auto-finance": {
    label: "Auto finance",
    eyebrow: "Auto finance · Dealer F&I",
    headline: "Stips cleared before the customer leaves the lot.",
    sub: "Your buyer scans their ID, connects their bank and consents to the credit pull on their own phone, in one sitting. No account, no paystub photos. You send the lender one decision-ready file.",
    cta: { label: "Book a demo", href: "https://oncarousel.com/book-a-demo/" },
    secondary: { label: "See a sample report", href: "https://oncarousel.com/assets/sample/screening-report-example.pdf" },
    quote: {
      text: "We weren’t losing those deals on price. We were losing them to paperwork.",
      who: "F&I, Holand Leasing",
    },
    mock: {
      title: "Deal 4812",
      meta: "2023 RAV4 XLE · $31,900",
      person: "Marc-André Roy",
      initials: "MR",
      checks: [
        { name: "ID scan", detail: "Driver’s licence", state: "done" },
        { name: "Selfie", detail: "Matched to ID", state: "done" },
        { name: "Connect your bank", detail: "12 months of deposits", state: "now" },
        { name: "Credit consent", detail: "TransUnion or Equifax", state: "next" },
      ],
    },
  },

  "commercial-screening": {
    label: "Commercial leasing",
    eyebrow: "Commercial leasing · Credit desk",
    headline: "A full tenant file before the tour ends.",
    sub: "The applicant proves who they are and what the business earns from their phone, in one sitting. Your credit desk reads one report instead of chasing statements by email.",
    cta: { label: "Book a demo", href: "https://oncarousel.com/book-a-demo/" },
    secondary: { label: "See a sample report", href: "https://oncarousel.com/assets/sample/screening-report-example.pdf" },
    quote: {
      text: "Screening was the one thing that never lived where we actually work.",
      who: "Operations, Unity Leases",
    },
    mock: {
      title: "Suite 400",
      meta: "1450 Rue Saint-Denis · $6,400/mo",
      person: "Léa Tremblay",
      initials: "LT",
      checks: [
        { name: "ID scan", detail: "Driver’s licence", state: "done" },
        { name: "Selfie", detail: "Matched to ID", state: "done" },
        { name: "Connect your bank", detail: "Business account", state: "now" },
        { name: "Court records", detail: "Québec · Canada", state: "next" },
      ],
    },
  },
};

export const DEFAULT_VERTICAL = "auto-finance";

/* Published on oncarousel.com, shared by every vertical. */
export const STATS = [
  { value: "11 min", label: "median to a decision-ready file" },
  { value: "93%", label: "of applicants finish" },
  { value: "248,317", label: "files processed" },
];
