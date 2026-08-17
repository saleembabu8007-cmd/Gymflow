import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorState } from '../ui/ErrorState';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[300px] flex items-center justify-center p-6">
          <ErrorState
            title="Something went wrong"
            message={this.state.error?.message || "Couldn't load this screen properly. Please try reloading or check your connection."}
            onRetry={this.handleReset}
            retryLabel="Reload Page"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
