import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createBrowserClient();
        if (!supabase) {
          console.error('Supabase not configured');
          navigate('/login?error=supabase_not_configured');
          return;
        }
        
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=auth_callback_failed');
          return;
        }

        navigate('/projects');
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        navigate('/login?error=unexpected');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
