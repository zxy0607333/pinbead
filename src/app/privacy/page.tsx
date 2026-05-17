import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Pinbead handles browser-based image conversion, local pattern data, analytics, advertising, and cookies.",
};

const sections = [
  {
    title: "Information we process",
    body: [
      "Pinbead provides browser-based tools for creating bead patterns, converting images into editable drafts, browsing published patterns, and reading guides.",
      "The current image converter and editor are designed to run in your browser. We do not intentionally upload your original image to Pinbead servers for conversion in the current product.",
    ],
    items: [
      "Pattern drafts, editor settings, and imported pattern data may be stored in your browser so the tools can work smoothly.",
      "Published library content, categories, guides, and admin records are stored on Pinbead servers.",
      "If you contact us by email, we receive the information you choose to send, such as your name, email address, and message.",
    ],
  },
  {
    title: "Analytics, ads, and cookies",
    body: [
      "Pinbead may use analytics tools to understand page views, tool usage, device type, browser type, approximate region, referrers, and performance issues.",
      "Pinbead plans to use Google AdSense. Google and other advertising partners may use cookies or similar technologies to serve ads, measure performance, limit repeated ads, and personalize advertising where allowed.",
    ],
    items: [
      "Third-party vendors, including Google, may use cookies to serve ads based on prior visits to Pinbead or other websites.",
      "Google's use of advertising cookies enables Google and its partners to serve ads based on visits to Pinbead and other websites.",
      "You can manage personalized advertising through Google Ads Settings or your browser privacy controls.",
    ],
  },
  {
    title: "How we use information",
    items: [
      "Operate and improve the editor, converter, pattern library, guides, and admin publishing tools.",
      "Protect the service from abuse, spam, security issues, and policy violations.",
      "Respond to support, copyright, and business inquiries.",
      "Prepare aggregate analytics that help us decide what to improve before adding heavier community features.",
    ],
  },
  {
    title: "Uploads and user content",
    body: [
      "Pinbead is currently focused on browser-side tools and curated published content. When user upload or public sharing features are added, public content will need moderation, rights review, and additional product controls before it is indexed or monetized.",
      "Do not upload, publish, or submit content unless you have the right to use it.",
    ],
  },
  {
    title: "Retention and choices",
    items: [
      "You can clear browser storage through your browser settings to remove local drafts and local tool data.",
      "You can block or delete cookies through your browser settings, but some features may work less smoothly.",
      "You can contact us to request access, correction, or deletion of personal information that we control.",
    ],
  },
  {
    title: "Contact",
    body: [
      `For privacy questions, contact ${siteConfig.contactEmail}. If you are contacting us about copyright, please use the Copyright / DMCA page so we receive the required details.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      description="This policy explains what Pinbead processes, what stays local in the browser, and how analytics, advertising, and cookies may be used."
      sections={sections}
      title="Privacy Policy"
    >
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm leading-6 text-[var(--muted)]">
        This policy is written for the current Pinbead product. Review it again
        before enabling public user uploads, account features, or new ad
        partners. See also{" "}
        <Link
          className="font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
          href="/terms"
        >
          Terms of Service
        </Link>
        .
      </div>
    </LegalPage>
  );
}
