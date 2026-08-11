import { OnboardingProvider } from '@/features/onboarding/state';
import { OnboardingShell } from '@/features/onboarding/components';

export default function OnboardingPage() {
  return <OnboardingProvider><OnboardingShell /></OnboardingProvider>;
}
