import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/ui/cn';
import { Input } from './Input';

export interface Organization {
  id: string;
  name: string;
  avatar?: string;
}

export interface OrgSwitcherProps {
  organizations: Organization[];
  currentOrgId: string;
  onSwitch: (orgId: string) => void;
  className?: string;
}

export const OrgSwitcher = ({ organizations, currentOrgId, onSwitch, className }: OrgSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentOrg = organizations.find((org) => org.id === currentOrgId);

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
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

  const handleSwitch = (orgId: string) => {
    onSwitch(orgId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch organization"
      >
        {currentOrg?.avatar && (
          <img src={currentOrg.avatar} alt="" className="h-5 w-5 rounded" aria-hidden="true" />
        )}
        <span className="flex-1 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {currentOrg?.name || 'Select organization'}
        </span>
        <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400 flex-shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
        >
          <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search organizations"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {filteredOrgs.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                No organizations found
              </div>
            ) : (
              filteredOrgs.map((org) => {
                const isSelected = org.id === currentOrgId;

                return (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-700"
                    role="menuitem"
                    aria-current={isSelected ? 'true' : undefined}
                  >
                    {org.avatar && (
                      <img src={org.avatar} alt="" className="h-5 w-5 rounded flex-shrink-0" aria-hidden="true" />
                    )}
                    <span className="flex-1 text-left truncate">{org.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
