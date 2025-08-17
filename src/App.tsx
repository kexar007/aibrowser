import React from 'react';
import AIAgenticBrowser from './components/AIAgenticBrowser';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('Error caught in boundary:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          Something went wrong. Check console for details.
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering');
  return (
    <ErrorBoundary>
      <AIAgenticBrowser />
    </ErrorBoundary>
  );
}

export default App;