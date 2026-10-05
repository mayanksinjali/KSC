import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { getSettings } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = settings.seo_title || settings.club_name;
  const description = settings.seo_description;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${settings.club_name}`,
    },
    description,
    applicationName: settings.club_name,
    keywords: [
      "Kanti Science Club",
      "Kanti Secondary School",
      "Butwal",
      "Nepal",
      "science club",
      "student science",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: settings.club_name,
      title,
      description,
      url: "/",
      images: [{ url: settings.og_image_url || "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [settings.og_image_url || "/opengraph-image"],
    },
    icons: settings.favicon_url ? { icon: settings.favicon_url } : { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.club_name,
    url: siteUrl,
    description: settings.seo_description,
    email: settings.contact_email || undefined,
    sameAs: settings.facebook_url ? [settings.facebook_url] : undefined,
    logo: {
      "@type": "ImageObject",
      url: new URL(settings.logo_url || "/favicon.svg", siteUrl).toString(),
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Butwal",
      addressRegion: "Lumbini",
      addressCountry: "NP",
    },
    parentOrganization: {
      "@type": "School",
      name: "Kanti Secondary School",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Butwal",
        addressCountry: "NP",
      },
    },
  };
  const jsonLdScript = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      </body>
    </html>
  );
}
