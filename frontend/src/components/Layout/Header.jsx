import { useState } from 'react';
import { Search, Bell, Moon, Sun, Command } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../UI/Button';
import { Tooltip } from '../UI/Tooltip';

export const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 flex-1">
          <div className={`hidden md:flex items-center flex-1 max-w-md rounded-xl border transition-all duration-200 ${searchFocused ? 'border-primary/50 bg-primary/5 shadow-glow' : 'border-border bg-secondary'}`}>
            <Search className={`h-4 w-4 ml-3 transition-colors ${searchFocused ? 'text-primary' : 'text-foreground-subtle'}`} />
            <input
              type="text"
              placeholder="Search tickets, test cases..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full py-2.5 placeholder:text-foreground-subtle"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            <div className="flex items-center gap-1 mr-2 text-foreground-subtle">
              <Command className="h-3 w-3" />
              <span className="text-xs">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content={isDark ? 'Light mode' : 'Dark mode'}>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </Tooltip>

          <Tooltip content="Notifications">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background animate-pulse" />
            </Button>
          </Tooltip>

          <div className="h-6 w-px bg-border mx-1" />

          <div className="flex items-center gap-2 pl-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-xs shadow-glow">
              EAI
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};