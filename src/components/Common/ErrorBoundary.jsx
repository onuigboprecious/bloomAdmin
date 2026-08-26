import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Bloom Admin] Uncaught Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-slate-50 border border-rose-200 text-slate-900 max-w-xl mx-auto my-12 space-y-4">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertTriangle className="w-8 h-8 shrink-0" />
            <h2 className="text-xl font-bold">Admin Module Error</h2>
          </div>
          <p className="text-sm text-slate-600">
            An unexpected data format was encountered while rendering this view.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-xs text-rose-800 break-all">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088CC] text-white font-extrabold text-sm hover:bg-[#007AAB]"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Admin View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
