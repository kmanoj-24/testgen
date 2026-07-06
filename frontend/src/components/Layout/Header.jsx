import { useState } from 'react';
import { Search, Bell, Moon, Sun, Command } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const Header = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex flex-1 items-center gap-4 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <span className="font-medium text-foreground">Solix AI</span>
          <span className="text-foreground-subtle">/</span>
          <span className="text-foreground-subtle">Project Alpha</span>
        </div>

        {/* Search */}
        <div className={`hidden md:flex flex-1 max-w-md items-center gap-2 rounded-md border px-3 py-1.5 transition-all duration-200 ${searchFocused ? 'border-primary bg-primary/5' : 'border-border bg-secondary'}`}>
          <Search className={`h-3.5 w-3.5 transition-colors ${searchFocused ? 'text-primary' : 'text-foreground-subtle'}`} />
          <input
            type="text"
            placeholder="Search tickets, test cases..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="flex items-center gap-0.5 text-foreground-subtle">
            <Command className="h-3 w-3" />
            <span className="text-[10px]">K</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-3">
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-destructive ring-2 ring-background" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-2 pl-1">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
            E
          </div>
        </div>
      </div>
    </header>
  );
};