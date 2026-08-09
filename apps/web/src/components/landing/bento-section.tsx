import { landingFeatures } from '@/mocks/landing';
import { SectionHeader, SectionShell, Surface } from './shared';

const layoutStyles = {
  large: 'md:col-span-2 md:row-span-2',
  medium: 'md:col-span-1 md:row-span-1',
  small: 'md:col-span-1 md:row-span-1',
} as const;

export function FeatureBentoSection() {
  return (
    <SectionShell>
      <SectionHeader
        eyebrow="Feature set"
        title="Built for governance teams, security teams, and auditors"
        description="The platform separates authoritative records, supporting workflows, and projections so each feature can evolve without blurring source of truth."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2 md:auto-rows-[180px] xl:grid-cols-4">
        {landingFeatures.map((feature, index) => (
          <Surface
            key={feature.title}
            className={`p-5 sm:p-6 ${layoutStyles[feature.layout]} ${index === 0 ? 'bg-bg-elevated' : ''}`}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="text-xs uppercase tracking-[0.24em] text-brand-accent/80">0{index + 1}</div>
              <div>
                <h3 className="font-heading text-2xl text-text-primary">{feature.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">{feature.detail}</p>
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </SectionShell>
  );
}
