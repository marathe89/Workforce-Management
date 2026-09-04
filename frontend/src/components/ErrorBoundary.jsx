import React from 'react';

// Without this, an uncaught render error anywhere in the tree (e.g. a page
// component throwing on unexpected API data) unmounts the entire app,
// leaving a blank page with no sidebar or navigation.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-950 p-6">
          <div className="bg-ink-800 border border-ink-600 rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <h1 className="text-xl font-bold text-gray-100 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              This page hit an unexpected error. Try reloading — if it keeps happening, please report it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-brand-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
