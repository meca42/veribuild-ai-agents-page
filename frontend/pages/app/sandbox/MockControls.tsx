import { useState } from 'react';
import { RefreshCw, Settings, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormRow } from '@/components/ui/FormRow';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { getMockConfig, setMockConfig } from '@/lib/mocks/latency';
import { resetDatabase, getDatabase } from '@/lib/mocks/db';

export default function MockControls() {
  const config = getMockConfig();
  const [minDelay, setMinDelay] = useState(config.minDelay);
  const [maxDelay, setMaxDelay] = useState(config.maxDelay);
  const [errorRate, setErrorRate] = useState(config.errorRate * 100);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { addToast } = useToast();

  const handleApplyConfig = () => {
    setMockConfig({
      minDelay: Math.max(0, minDelay),
      maxDelay: Math.max(minDelay, maxDelay),
      errorRate: Math.max(0, Math.min(100, errorRate)) / 100,
    });
    addToast('Mock configuration updated', 'success');
  };

  const handleResetDatabase = () => {
    resetDatabase();
    setShowResetConfirm(false);
    addToast('Database reset successfully. Refresh the page to see changes.', 'success');
  };

  const db = getDatabase();
  const stats = {
    organizations: db.organizations.length,
    projects: db.projects.length,
    phases: db.phases.length,
    steps: db.steps.length,
    drawings: db.drawings.length,
    documents: db.documents.length,
    rfis: db.rfis.length,
    submittals: db.submittals.length,
    bomItems: db.bomItems.length,
    issues: db.issues.length,
    inspections: db.inspections.length,
    agents: db.agents.length,
    agentRuns: db.agentRuns.length,
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Mock Data Controls
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configure mock API behavior and manage test data
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Network Simulation
              </h2>
            </div>

            <div className="space-y-4">
              <FormRow
                label="Minimum Delay (ms)"
                htmlFor="min-delay"
                help="Minimum simulated network latency"
              >
                <Input
                  id="min-delay"
                  type="number"
                  value={minDelay}
                  onChange={(e) => setMinDelay(parseInt(e.target.value) || 0)}
                  min={0}
                  max={5000}
                />
              </FormRow>

              <FormRow
                label="Maximum Delay (ms)"
                htmlFor="max-delay"
                help="Maximum simulated network latency"
              >
                <Input
                  id="max-delay"
                  type="number"
                  value={maxDelay}
                  onChange={(e) => setMaxDelay(parseInt(e.target.value) || 0)}
                  min={0}
                  max={5000}
                />
              </FormRow>

              <FormRow
                label="Error Rate (%)"
                htmlFor="error-rate"
                help="Percentage of requests that should fail"
              >
                <Input
                  id="error-rate"
                  type="number"
                  value={errorRate}
                  onChange={(e) => setErrorRate(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </FormRow>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleApplyConfig}>
                  Apply Configuration
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMinDelay(config.minDelay);
                    setMaxDelay(config.maxDelay);
                    setErrorRate(config.errorRate * 100);
                  }}
                >
                  Reset to Current
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Database Statistics
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Danger Zone
              </h3>
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                  Resetting the database will regenerate all mock data with a new random seed. This action cannot be
                  undone. You will need to refresh the page to see the new data.
                </p>
                <Button variant="destructive" onClick={() => setShowResetConfirm(true)}>
                  <RefreshCw className="h-4 w-4" />
                  Reset Database
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Development Notes
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li>• All data is stored in-memory and will reset on page refresh</li>
              <li>• API calls use simulated latency to mimic real network conditions</li>
              <li>• The error rate determines how often API calls will randomly fail</li>
              <li>• All hooks and API methods are ready to be swapped with real backend implementations</li>
              <li>• Data is scoped by organization ID (currently: org-1)</li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetDatabase}
        title="Reset Mock Database"
        message="This will delete all current mock data and regenerate fresh data. Any changes you've made will be lost."
        confirmText="Reset Database"
        cancelText="Cancel"
        variant="danger"
        requireTypedConfirmation
        confirmationText="RESET"
      />
    </div>
  );
}
