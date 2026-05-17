import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Pinbead about support, pattern library feedback, privacy questions, copyright notices, or business inquiries.",
};

const sections = [
  {
    title: "Email",
    body: [
      `For general questions, support, feedback, and business inquiries, email ${siteConfig.contactEmail}.`,
      "Please include the page URL, a short description of the issue, your browser or device if relevant, and any steps that help us reproduce the problem.",
    ],
  },
  {
    title: "What to send",
    items: [
      "Editor or converter feedback, including the grid size and mode you used.",
      "Pattern library corrections, such as wrong dimensions, color counts, or broken downloads.",
      "Guide suggestions for bead pattern beginners.",
      "Privacy, terms, or advertising questions.",
    ],
  },
  {
    title: "Copyright notices",
    body: [
      "For copyright or DMCA requests, use the Copyright / DMCA page details so your notice includes the information needed for review.",
    ],
  },
  {
    title: "Response time",
    body: [
      "Pinbead is an early-stage site, so response times may vary. We prioritize security, privacy, copyright, and broken public pages first.",
    ],
  },
];

export default function ContactPage() {
  return (
    <LegalPage
      description="Use this page to reach Pinbead about support, feedback, rights issues, and site questions."
      sections={sections}
      title="Contact"
    >
      <a
        className="inline-flex rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        href={`mailto:${siteConfig.contactEmail}`}
      >
        Email {siteConfig.contactEmail}
      </a>
    </LegalPage>
  );
}
