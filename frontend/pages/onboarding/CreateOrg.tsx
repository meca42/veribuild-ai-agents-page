import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormRow } from '@/components/ui/FormRow';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { createBrowserClient } from '@/lib/supabase/client';

export default function CreateOrg() {
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, refreshOrgs, setCurrentOrgId } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgName.trim()) {
      addToast('Organization name is required', 'error');
      return;
    }

    const supabase = createBrowserClient();
    if (!supabase) {
      addToast('Supabase not configured', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { data: org, error: orgError } = await supabase
        .from('orgs')
        .insert({ name: orgName })
        .select()
        .single();

      if (orgError) {
        console.error('Org creation error:', orgError);
        throw orgError;
      }

      console.log('Org created:', org);

      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          org_id: org.id,
          user_id: user!.id,
          role: 'owner',
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
        throw memberError;
      }

      console.log('Member created successfully');

      await refreshOrgs();
      setCurrentOrgId(org.id);
      
      addToast('Organization created successfully', 'success');
      navigate('/projects');
    } catch (error: any) {
      console.error('Create org error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      addToast(error.message || 'Failed to create organization', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 shadow-lg">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Create your organization
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Set up your workspace to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormRow label="Organization Name" htmlFor="orgName" required>
              <Input
                id="orgName"
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Construction Co."
                required
                disabled={isLoading}
                autoFocus
              />
            </FormRow>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              Create Organization
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
