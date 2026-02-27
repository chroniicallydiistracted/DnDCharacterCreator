import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage }    from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { SheetPage }   from './pages/SheetPage';

// ─── Error Boundary ──────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error?: Error }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-page-bg text-parchment p-8">
          <div className="surface-parchment rounded p-8 max-w-lg text-center space-y-4">
            <h1 className="font-display text-2xl text-crimson">Something went wrong</h1>
            <p className="font-body text-stone text-sm">{this.state.error?.message ?? 'An unexpected error occurred.'}</p>
            <button
              onClick={() => window.location.assign('/')}
              className="px-4 py-2 rounded bg-gold text-page-bg font-display uppercase tracking-wider text-sm hover:bg-gold/80 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<HomePage />}    />
          <Route path="/builder"   element={<BuilderPage />} />
          <Route path="/sheet/:id" element={<SheetPage />}   />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
