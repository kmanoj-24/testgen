import { Monitor, Moon, Sun, Bell, Database } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useTheme } from '../hooks/useTheme';

export const SettingsPage = () => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground-muted mt-0.5">Manage your preferences and configuration</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-foreground-muted" />
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Theme</p>
                <p className="text-xs text-foreground-muted">Choose your preferred color scheme</p>
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-md bg-secondary border border-border">
                <button
                  onClick={() => isDark && toggleTheme()}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${!isDark ? 'bg-background text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
                <button
                  onClick={() => !isDark && toggleTheme()}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${isDark ? 'bg-background text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground'}`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-foreground-muted" />
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Email Notifications</p>
                <p className="text-xs text-foreground-muted">Receive updates about test generation</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Slack Integration</p>
                <p className="text-xs text-foreground-muted">Send alerts to Slack channels</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-secondary border border-border relative cursor-pointer">
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground-muted" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-foreground-muted" />
              <h3 className="text-sm font-semibold text-foreground">API Configuration</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">Jira Base URL</label>
              <input type="text" defaultValue="https://jira.company.com" className="input font-mono text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1">API Token</label>
              <input type="password" defaultValue="••••••••••••" className="input font-mono text-sm" />
            </div>
            <div className="flex justify-end">
              <Button size="sm">Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};