// src/providers/ErrorBoundary.tsx

import ErrorBoundaryPage from '@modules/app/screens/ErrorBoundaryPage'
import React from 'react'

interface ErrorBoundaryProps {
  children: never
}

/**
 * ErrorBoundary is a React component that catches and handles errors in its child components.
 * It renders an error page when an error occurs, otherwise it renders its children.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: never, errorInfo: never): void {
    /**
     * We can capture the error with any error tracking tool
     * Like:
     *
     *  Sentry.captureException(error);
     *  crashlytics().recordError(error);
     *  Bugsnag.notify(error)
     *  rollbar.error(error)
     */
    console.error('error', error, errorInfo)
  }

  render(): React.ReactElement {
    if (this.state.hasError) {
      return <ErrorBoundaryPage />
    }
    return this.props.children
  }
}
