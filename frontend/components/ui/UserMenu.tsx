import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, User } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Avatar } from './Avatar';

export interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onProfile?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
  className?: string;
}

export const UserMenu = ({ user, onProfile, onSettings, onLogout, className }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (action?: () => void) => {
    action?.();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <Avatar src={user.avatar} fallback={user.name} size="sm" />
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user.name}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</div>
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
            <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{user.name}</div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</div>
          </div>

          <div className="py-1">
            {onProfile && (
              <button
                onClick={() => handleItemClick(onProfile)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700"
                role="menuitem"
              >
                <User className="h-4 w-4" aria-hidden="true" />
                Profile
              </button>
            )}
            {onSettings && (
              <button
                onClick={() => handleItemClick(onSettings)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700"
                role="menuitem"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </button>
            )}
          </div>

          {onLogout && (
            <div className="py-1 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => handleItemClick(onLogout)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
