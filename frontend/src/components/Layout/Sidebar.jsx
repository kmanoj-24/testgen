import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  FileSpreadsheet, 
  Settings, 
  GitBranch 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Fetch Tickets', href: '/tickets', icon: Ticket },
  { name: 'Test Cases', href: '/testcases', icon: FileSpreadsheet },
  { name: 'Workflow', href: '/workflow', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Solix AI</span>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-x-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold text-sm">EAI</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">EAI_QA</span>
              <span className="text-xs text-gray-500">QA Lead</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};