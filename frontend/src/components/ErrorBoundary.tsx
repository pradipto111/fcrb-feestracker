/**
 * Error Boundary Component
 * Catches React errors and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { colors, typography, spacing } from '../theme/design-tokens';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (in production, this would go to error tracking service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorTracking(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
          background: colors.surface.bg,
        }}>
          <Card variant="default" padding="lg" style={{ maxWidth: '600px', width: '100%' }}>
            <h2 style={{ ...typography.h3, color: colors.danger.main, marginBottom: spacing.md }}>
              Something went wrong
            </h2>
            <p style={{ ...typography.body, color: colors.text.secondary, marginBottom: spacing.md }}>
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
                <summary style={{ ...typography.caption, color: colors.text.muted, cursor: 'pointer' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: spacing.sm,
                  padding: spacing.md,
                  background: colors.surface.soft,
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: typography.fontSize.xs,
                  color: colors.text.secondary,
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <Button
                variant="primary"
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

