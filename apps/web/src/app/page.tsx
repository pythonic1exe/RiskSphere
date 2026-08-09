import { FinalCtaSection } from '@/components/landing/final-cta-section';
import { HeroSection } from '@/components/landing/hero/hero-section';
import { GrcLifecycleSection } from '@/components/landing/grc-lifecycle-section';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { MultiTenantSection } from '@/components/landing/multi-tenant-section';
import { LandingFooter } from '@/components/landing/landing-footer';
import { PlatformCapabilitiesSection } from '@/components/landing/platform-capabilities-section';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-app text-text-primary">
      <LandingNavbar />
      <HeroSection />
      <GrcLifecycleSection />
      <MultiTenantSection />
      <PlatformCapabilitiesSection />
      <FinalCtaSection />
      <LandingFooter />
    </main>
  );
}
