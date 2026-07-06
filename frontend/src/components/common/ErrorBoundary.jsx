import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Something went wrong</h3>
          <p className="text-xs text-foreground-muted mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary text-xs"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}