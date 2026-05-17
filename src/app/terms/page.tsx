import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the basic terms for using Pinbead tools, pattern library pages, guides, and downloadable bead pattern content.",
};

const sections = [
  {
    title: "Using Pinbead",
    body: [
      "Pinbead provides bead pattern tools, conversion drafts, editable grids, printable pattern pages, guides, and related content.",
      "You may use Pinbead for personal craft planning, learning, and creating your own bead projects, subject to these terms and applicable law.",
    ],
  },
  {
    title: "Tool output",
    body: [
      "The image converter creates an editable draft. It may not match your source image perfectly and may need manual editing before a real bead project is made.",
      "You are responsible for checking colors, dimensions, bead counts, print settings, and safety considerations before making a project.",
    ],
  },
  {
    title: "Content rights",
    items: [
      "Do not submit, upload, publish, or request content that infringes someone else's copyright, trademark, privacy, publicity, or other rights.",
      "Published Pinbead library content and guide content may not be scraped, republished, sold, or used to create a competing library without permission.",
      "You remain responsible for images or designs you choose to use with the editor or converter.",
    ],
  },
  {
    title: "Accounts and admin access",
    body: [
      "Public account and community features are not part of the initial launch. Admin tools are restricted to authorized Pinbead operators.",
      "Attempting to access admin tools, publishing systems, databases, or other non-public parts of the service without permission is prohibited.",
    ],
  },
  {
    title: "Advertising",
    body: [
      "Pinbead may display ads on content pages. Ads should not be placed in ways that make tool buttons, upload controls, downloads, or navigation confusing.",
      "Advertising does not mean Pinbead endorses the advertiser, product, or linked website.",
    ],
  },
  {
    title: "No warranty",
    body: [
      "Pinbead is provided as is and as available. We do not guarantee that every pattern, guide, export, color match, or conversion result will be error-free or suitable for every project.",
      "To the fullest extent allowed by law, Pinbead is not liable for indirect, incidental, or consequential damages from use of the site.",
    ],
  },
  {
    title: "Contact",
    body: [
      `Questions about these terms can be sent to ${siteConfig.contactEmail}.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      description="These terms describe the basic rules for using Pinbead's tools, published content, and guides."
      sections={sections}
      title="Terms of Service"
    />
  );
}
