import { USE_MOCK_API, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env';
import { Badge } from '@/components/ui/Badge';

export default function EnvDebug() {
  const maskKey = (key: string) => {
    if (!key) return '(empty)';
    if (key.length < 20) return '***';
    return `${key.slice(0, 20)}...${key.slice(-10)}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Environment Configuration
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Debug view of current environment variables and configuration
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            API Mode
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-neutral-700 dark:text-neutral-300">USE_MOCK_API:</span>
            {USE_MOCK_API ? (
              <Badge variant="warning">Mock Mode Active</Badge>
            ) : (
              <Badge variant="success">Real Supabase Mode</Badge>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            {USE_MOCK_API 
              ? 'Using in-memory mock data. Supabase client will not be initialized.'
              : 'Using real Supabase backend with authentication and database.'}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Supabase Configuration
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  SUPABASE_URL:
                </span>
                {SUPABASE_URL ? (
                  <Badge variant="success">Configured</Badge>
                ) : (
                  <Badge variant="danger">Missing</Badge>
                )}
              </div>
              <code className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                {SUPABASE_URL || '(not set)'}
              </code>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                  SUPABASE_ANON_KEY:
                </span>
                {SUPABASE_ANON_KEY ? (
                  <Badge variant="success">Configured</Badge>
                ) : (
                  <Badge variant="danger">Missing</Badge>
                )}
              </div>
              <code className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                {maskKey(SUPABASE_ANON_KEY)}
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Status Summary
          </h2>
          <div className="space-y-2">
            {USE_MOCK_API ? (
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠</span>
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    Running in Mock Mode
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Set <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">USE_MOCK_API=false</code> in 
                    <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded ml-1">.env.local</code> to enable Supabase
                  </p>
                </div>
              </div>
            ) : !SUPABASE_URL || !SUPABASE_ANON_KEY ? (
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✕</span>
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    Supabase Not Configured
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Add <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">VITE_SUPABASE_URL</code> and 
                    <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded ml-1">VITE_SUPABASE_ANON_KEY</code> to 
                    <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded ml-1">.env.local</code>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <div>
                  <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                    Supabase Ready
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    All required environment variables are configured
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Configuration Instructions
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Copy <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env.local.example</code> to <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env.local</code></li>
            <li>Set your Supabase project URL and anon key</li>
            <li>Set <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">USE_MOCK_API=false</code> to enable real backend</li>
            <li>Restart the dev server for changes to take effect</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
