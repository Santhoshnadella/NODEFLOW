import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <h1 style={{ color: '#f43f5e' }}>Something went wrong.</h1>
          <p style={{ color: '#94a3b8' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '20px', padding: '10px 20px', background: '#6366f1', 
              border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' 
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
