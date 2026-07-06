export const QuickActions = () => (
  <div className="space-y-3">
    <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wide">Quick Actions</h2>
    <div className="grid grid-cols-2 gap-3">
      {[
        { title: 'Fetch Tickets', desc: 'Import from Jira', href: '/tickets', icon: '🎫' },
        { title: 'Generate', desc: 'AI test cases', href: '/tickets', icon: '✨' },
        { title: 'Review', desc: 'Approve & edit', href: '/testcases', icon: '✓' },
        { title: 'Workflow', desc: 'Automation', href: '/workflow', icon: '⚡' },
      ].map((action) => (
        <a
          key={action.title}
          href={action.href}
          className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-4 hover:shadow-md hover:border-border-strong transition-all group"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl">{action.icon}</span>
            <div>
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
              <p className="text-xs text-foreground-muted mt-0.5">{action.desc}</p>
            </div>
          </div>
        </a>
      ))}
    </div>
  </div>
);