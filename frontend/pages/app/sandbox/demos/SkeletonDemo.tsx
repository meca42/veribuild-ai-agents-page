import { useState } from 'react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export const SkeletonDemo = () => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Loading States</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Skeleton loaders provide visual feedback while content is loading
        </p>

        <Button onClick={() => setShowContent(!showContent)}>
          {showContent ? 'Show Skeletons' : 'Show Content'}
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Text Skeleton</h3>
        {showContent ? (
          <div className="space-y-2">
            <p className="text-neutral-900 dark:text-neutral-100">
              This is some loaded content that appears after the skeleton.
            </p>
            <p className="text-neutral-700 dark:text-neutral-300">
              Multiple paragraphs can be displayed here with varying lengths.
            </p>
            <p className="text-neutral-600 dark:text-neutral-400">
              The skeleton provides a smooth loading experience.
            </p>
          </div>
        ) : (
          <SkeletonText lines={3} />
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Card Skeleton</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {showContent ? (
            <>
              <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Project Alpha</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Commercial building construction project in downtown area
                </p>
                <div className="flex gap-2">
                  <Button size="sm">View</Button>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </div>
              <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Project Beta</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Residential complex with modern amenities and green spaces
                </p>
                <div className="flex gap-2">
                  <Button size="sm">View</Button>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Table Skeleton</h3>
        {showContent ? (
          <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-900 dark:text-neutral-100">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-900 dark:text-neutral-100">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-900 dark:text-neutral-100">Progress</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-900 dark:text-neutral-100">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <tr>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">Foundation Work</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">In Progress</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">75%</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">Dec 15, 2025</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">Framing</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">Pending</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">0%</td>
                  <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">Jan 10, 2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <SkeletonTable rows={2} columns={4} />
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Custom Skeleton Shapes</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
