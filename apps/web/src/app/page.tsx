import { ControlSystemSection } from '@/components/landing/control-system-section';
import { Footer } from '@/components/landing/footer';
import { FinalCtaSection } from '@/components/landing/final-cta';
import { HeroSection } from '@/components/landing/hero/hero-section';
import { LandingNavbar } from '@/components/landing/landing-navbar';
import { PlatformLifecycleSection } from '@/components/landing/platform-lifecycle';
import { AuditShowcaseSection } from '@/components/landing/audit-showcase';
import { SecuritySection } from '@/components/landing/security-section';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-app text-text-primary">
      <LandingNavbar />
      <HeroSection />
      <PlatformLifecycleSection />
      <ControlSystemSection />
      <AuditShowcaseSection />
      <SecuritySection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
