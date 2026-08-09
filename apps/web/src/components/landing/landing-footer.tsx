import Link from 'next/link';

const platformLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Tenancy', href: '#tenancy' },
];

const accountLinks = [
  { label: 'Sign In', href: '/signin' },
  { label: 'Request Demo', href: '#cta' },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-base px-6 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <div className="mx-auto max-w-[92rem]">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-20">
          <div className="max-w-sm">
            <Link href="/" className="font-brand text-sm uppercase tracking-[0.28em] text-text-primary">
              RiskSphere
            </Link>
            <p className="mt-5 text-sm leading-6 text-text-secondary">
              Governance, risk, compliance and audit management in one connected workspace.
            </p>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">Platform</p>
            <nav className="mt-4 grid gap-3" aria-label="Platform footer links">
              {platformLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-muted">Account</p>
            <nav className="mt-4 grid gap-3" aria-label="Account footer links">
              {accountLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-border-subtle pt-6 text-xs text-text-muted sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 RiskSphere</span>
          <span>Built for operational GRC.</span>
        </div>
      </div>
    </footer>
  );
}
