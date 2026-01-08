/**
 * Step Error Boundary
 * Catches errors in lazy-loaded step components and provides recovery UI
 */

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface StepErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

interface StepErrorBoundaryState {
  hasError: boolean;
}

export class StepErrorBoundary extends Component<StepErrorBoundaryProps, StepErrorBoundaryState> {
  state: StepErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): StepErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-8 h-8 text-destructive mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Impossible de charger cette section
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
