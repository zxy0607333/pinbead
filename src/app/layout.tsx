import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pinbead",
    template: "%s | Pinbead",
  },
  description:
    "Turn images into printable pin bead patterns and browse beginner-friendly bead designs.",
  metadataBase: new URL("https://pinbead.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
