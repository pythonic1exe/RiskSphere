import Link from 'next/link';

import { Separator } from '@/components/ui/separator';

const footerLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Security', href: '#security' },
  { label: 'Sign in', href: '/signin' },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-app">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-brand text-sm uppercase tracking-[0.32em] text-text-primary">
              RiskSphere
            </p>
            <p className="mt-2 text-sm text-text-muted">GRC &amp; Audit Management Platform</p>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm text-text-secondary">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition-colors hover:text-text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="bg-border-subtle" />
        <p className="text-sm text-text-muted">
          RiskSphere is designed for tenant-scoped governance and traceable assurance workflows.
        </p>
      </div>
    </footer>
  );
}
