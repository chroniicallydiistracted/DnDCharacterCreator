import { AppShell } from '../components/layout/AppShell';
import { BuilderWizard } from '../components/builder/BuilderWizard';

export function BuilderPage() {
  return (
    <AppShell>
      <BuilderWizard />
    </AppShell>
  );
}
