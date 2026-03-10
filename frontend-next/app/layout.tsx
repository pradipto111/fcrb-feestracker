import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeferredThirdParty } from "@/components/DeferredThirdParty";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { GlobalLoaderProvider } from "@/components/GlobalLoaderProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RealVerse | FC Real Bengaluru Universe",
    template: "%s | FC Real Bengaluru",
  },
  description:
    "FC Real Bengaluru official universe: club story, academy pathways, fixtures and match updates.",
  metadataBase: new URL("https://realbengaluru.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <GlobalLoaderProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <DeferredThirdParty />
          <ServiceWorkerRegister />
        </GlobalLoaderProvider>
      </body>
    </html>
  );
}
