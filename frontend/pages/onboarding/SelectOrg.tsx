import { useNavigate } from 'react-router-dom';
import { Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth';

export default function SelectOrg() {
  const { organizations, setCurrentOrgId } = useAuth();
  const navigate = useNavigate();

  const handleSelectOrg = (orgId: string) => {
    setCurrentOrgId(orgId);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Select an organization
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose which organization you'd like to access
            </p>
          </div>

          <div className="space-y-3">
            {organizations.map((member) => (
              <button
                key={member.org_id}
                onClick={() => handleSelectOrg(member.org_id)}
                className="w-full flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {member.org.name}
                    </div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400">
                      <Badge variant={member.role === 'owner' ? 'info' : 'neutral'} className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300">
                  →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/onboarding/create-org')}
            >
              <Plus className="h-5 w-5" />
              Create new organization
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
