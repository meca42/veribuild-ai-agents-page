import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export const ToastDemo = () => {
  const { addToast } = useToast();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Toast Notifications</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Features: auto-dismiss, queue management, screen-reader accessible (aria-live region)
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => addToast('Operation completed successfully!', 'success')}>
            Show Success Toast
          </Button>
          <Button variant="destructive" onClick={() => addToast('An error occurred. Please try again.', 'error')}>
            Show Error Toast
          </Button>
          <Button variant="secondary" onClick={() => addToast('This is an informational message.', 'info')}>
            Show Info Toast
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Multiple Toasts</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Click to trigger multiple toasts in quick succession
        </p>

        <Button
          onClick={() => {
            addToast('First notification', 'info');
            setTimeout(() => addToast('Second notification', 'success'), 500);
            setTimeout(() => addToast('Third notification', 'error'), 1000);
          }}
        >
          Show Multiple Toasts
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Custom Duration</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Toasts with different auto-dismiss durations
        </p>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => addToast('This toast lasts 2 seconds', 'info', 2000)}>
            2 Second Toast
          </Button>
          <Button onClick={() => addToast('This toast lasts 10 seconds', 'success', 10000)}>
            10 Second Toast
          </Button>
          <Button onClick={() => addToast('This toast stays forever (duration: 0)', 'info', 0)}>
            Persistent Toast
          </Button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Accessibility Note</h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          All toasts are announced to screen readers via an ARIA live region with polite politeness level. The toast
          container appears in the bottom-right corner and includes proper dismiss buttons with aria-labels.
        </p>
      </div>
    </div>
  );
};
