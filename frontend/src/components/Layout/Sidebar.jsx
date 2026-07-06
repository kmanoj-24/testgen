import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard,
  Ticket,
  FileCheck,
  GitBranch,
  Settings,
  FlaskConical,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fetch Tickets', href: '/tickets', icon: Ticket },
  { name: 'Test Cases', href: '/testcases', icon: FileCheck },
  { name: 'Workflow', href: '/workflow', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-background transition-all duration-300 ease-out ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo + Toggle */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3 border-b border-border">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FlaskConical className="h-4 w-4" />
          </div>
          <span className={`text-sm font-semibold text-foreground whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            Solix AI
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-hidden">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              title={item.name}
              className={`group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-all duration-200 ${isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground-muted hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-foreground-subtle group-hover:text-foreground'}`} strokeWidth={1.5} />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                {item.name}
              </span>
              {isActive && !collapsed && <ChevronRight className="h-3.5 w-3.5 ml-auto text-primary shrink-0" />}
            </NavLink>
          );
        })}
      </nav>

      {/* User */}
      <div className="shrink-0 border-t border-border p-2">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2 hover:bg-secondary cursor-pointer transition-colors">
          <div className="h-7 w-7 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
            E
          </div>
          <div className={`flex flex-col min-w-0 transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <span className="text-xs font-medium text-foreground truncate">EAI_QA</span>
            <span className="text-[10px] text-foreground-subtle truncate">QA Lead</span>
          </div>
        </div>
      </div>
    </aside>
  );
};