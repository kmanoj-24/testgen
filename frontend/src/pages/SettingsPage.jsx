import { Monitor, Moon, Sun, Bell, Database } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { useTheme } from '../hooks/useTheme';

export const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">Manage your preferences and application configuration</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Appearance</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Theme</p>
              <p className="text-xs text-foreground-muted">Choose between light and dark mode</p>
            </div>
            <Button variant="secondary" onClick={toggleTheme} icon={isDark ? Sun : Moon}>{isDark ? 'Light Mode' : 'Dark Mode'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-foreground-muted">Receive updates when test cases are generated</p>
            </div>
            <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Integrations</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">Jira and AI service integrations are configured via environment variables.</p>
        </CardContent>
      </Card>
    </div>
  );
};