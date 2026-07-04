import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  FileSpreadsheet,
  GitBranch,
  Settings,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fetch Tickets', href: '/tickets', icon: Ticket },
  { name: 'Test Cases', href: '/testcases', icon: FileSpreadsheet },
  { name: 'Workflow', href: '/workflow', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-6 overflow-y-auto border-r border-border bg-card/50 backdrop-blur-xl px-6 pb-6">
        <div className="flex h-16 shrink-0 items-center gap-3 pt-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">TestGen AI</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-foreground-subtle">Enterprise</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-y-1">
          <p className="px-3 text-xs font-semibold text-foreground-subtle uppercase tracking-wider mb-2">
            Platform
          </p>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-primary/10 text-primary shadow-glow'
                  : 'text-foreground-muted hover:bg-secondary hover:text-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-foreground-subtle group-hover:text-foreground'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-x-3 rounded-xl px-3 py-2.5 hover:bg-secondary transition-colors cursor-pointer">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm shadow-glow">
              EAI
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">EAI_QA</span>
              <span className="text-xs text-foreground-subtle">QA Lead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};