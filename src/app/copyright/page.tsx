import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Copyright / DMCA",
  description:
    "Learn how to report copyright concerns, DMCA notices, and rights issues for Pinbead pattern pages or guides.",
};

const sections = [
  {
    title: "Respecting creator rights",
    body: [
      "Pinbead is intended for original, properly licensed, public domain, or rights-cleared bead pattern content.",
      "We do not want infringing material in the pattern library, guides, screenshots, previews, downloads, or future user sharing areas.",
    ],
  },
  {
    title: "Send a copyright notice",
    body: [
      `If you believe content on Pinbead infringes your copyright, email ${siteConfig.contactEmail} with the subject Copyright Notice.`,
    ],
    items: [
      "Your name and contact information.",
      "A description of the copyrighted work you believe has been infringed.",
      "The exact Pinbead URL or URLs where the material appears.",
      "A statement that you have a good-faith belief the disputed use is not authorized by the copyright owner, agent, or law.",
      "A statement that the information in your notice is accurate and that you are the copyright owner or authorized to act for the owner.",
      "Your physical or electronic signature.",
    ],
  },
  {
    title: "Review and removal",
    body: [
      "We may remove or restrict access to material while reviewing a notice. We may also request additional information if a notice is incomplete.",
      "Repeat infringement, rights abuse, or attempts to publish unauthorized content may lead to removal from the public library or future sharing features.",
    ],
  },
  {
    title: "Counter notices",
    body: [
      "If your content was removed and you believe the removal was a mistake, contact us with the URL, your explanation, and the information required by applicable law.",
    ],
  },
  {
    title: "Trademark and character designs",
    body: [
      "Some bead pattern ideas may involve brands, characters, logos, or fan art. Pinbead may reject, remove, or avoid monetizing content when rights are unclear or when it creates avoidable policy risk.",
    ],
  },
];

export default function CopyrightPage() {
  return (
    <LegalPage
      description="This page explains how rights holders can report copyright concerns and how Pinbead handles potentially infringing material."
      sections={sections}
      title="Copyright / DMCA"
    />
  );
}
