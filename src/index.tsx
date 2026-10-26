import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import reportWebVitals from './reportWebVitals';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

reportWebVitals();
