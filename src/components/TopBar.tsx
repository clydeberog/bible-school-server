import React from 'react';

export type NavTab = 'courses' | 'classes' | 'resources' | 'architecture';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  showArchitecture: boolean;
  userDisplayName: string | null;
  onAuthAction: () => void;
  isSigningIn: boolean;
}

const BASE_NAV_ITEMS: Array<{ id: NavTab; label: string }> = [
  { id: 'courses', label: 'Courses' },
  { id: 'classes', label: 'Live Classes' },
  { id: 'resources', label: 'Resources' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  showArchitecture,
  userDisplayName,
  onAuthAction,
  isSigningIn,
}) => {
  const [logoFailed, setLogoFailed] = React.useState(false);
  const navItems = showArchitecture
    ? [...BASE_NAV_ITEMS, { id: 'architecture' as NavTab, label: 'Architecture' }]
    : BASE_NAV_ITEMS;

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5DFD3] bg-[#FBF9F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-3.5">
        {/* Zone 1: Brand emblem + single-line wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('courses')}
          title="New Life Fundamental Baptist Church - School of Ministry"
          className="flex items-center gap-3 min-w-0 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded"
        >
          {!logoFailed && (
            <img
              src="/assets/aistudio/4a52c352-b439-44b9-9ab2-e11bf7c67dfe_57428442.jpg"
              alt="New Life Fundamental Baptist Church - School of Ministry logo"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="h-10 w-10 shrink-0 rounded-full border border-[#E5DFD3] bg-white object-contain p-0.5"
            />
          )}
          <span className="font-serif text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-[#1E293B] truncate max-w-[180px] sm:max-w-[340px] lg:max-w-none">
            New Life Fundamental Baptist Church - School of Ministry
          </span>
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded ${
                  isActive
                    ? 'text-[#1E3A8A] font-semibold'
                    : 'text-[#57534E] hover:text-[#1E293B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-1 h-[2px] bg-[#1E3A8A]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            disabled={isSigningIn}
            onClick={onAuthAction}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-[#172D6B] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E3A8A]"
          >
            {isSigningIn
              ? 'Connecting...'
              : userDisplayName
              ? `Sign out (${userDisplayName.split(' ')[0]})`
              : 'Sign in'}
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden items-center justify-between gap-2 border-t border-[#E5DFD3] px-4 py-2 overflow-x-auto"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-[#57534E] hover:text-[#1E293B]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
