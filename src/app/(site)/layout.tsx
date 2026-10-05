import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar clubName={settings.club_name} logoUrl={settings.logo_url || undefined} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
