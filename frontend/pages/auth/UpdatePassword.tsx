import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormRow } from '@/components/ui/FormRow';
import { useToast } from '@/components/ui/Toast';
import { updatePassword } from '@/lib/supabase/auth';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      
      addToast('Password updated successfully', 'success');
      navigate('/login');
    } catch (error: any) {
      console.error('Update password error:', error);
      addToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Set new password
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Choose a strong password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow label="New Password" htmlFor="newPassword" required help="At least 8 characters">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
            </FormRow>

            <FormRow label="Confirm Password" htmlFor="confirmPassword" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                  minLength={8}
                  disabled={isLoading}
                />
              </div>
            </FormRow>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
            >
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
