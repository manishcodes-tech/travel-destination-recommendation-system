import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TravelMate ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = "#/";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 p-8 text-center shadow-xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Oops! Something went wrong
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                We encountered an unexpected error rendering this section. Don't worry, your data and preferences are safe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3C1B] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" /> Go to Home
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 text-left text-xs bg-slate-50 p-3 rounded-xl text-slate-600 border border-slate-200 overflow-auto max-h-40">
                <summary className="font-semibold cursor-pointer text-slate-700">Error Details</summary>
                <p className="mt-1 font-mono text-[11px] text-rose-700">{this.state.error.toString()}</p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
