import React from 'react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxWidth: '600px',
            width: '100%',
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '16px', fontSize: '24px' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#666', marginBottom: '16px' }}>
              An error occurred while loading the application. Please check the browser console for details.
            </p>
            <details style={{ 
              backgroundColor: '#f8f8f8', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                marginTop: '12px',
                color: '#dc2626'
              }}>
                {this.state.error && this.state.error.toString()}
              </pre>
              <pre style={{ 
                fontSize: '11px', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                marginTop: '8px',
                color: '#666'
              }}>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
