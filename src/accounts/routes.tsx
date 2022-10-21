import * as Sentry from '@sentry/react';
import { RouteObject } from 'react-router-dom';
import { ErrorPage } from '../ui/containers';
import { RootAccounts } from '../ui/RootAccounts';

export const routes: RouteObject[] = [
  {
    element: (
      <Sentry.ErrorBoundary
        fallback={(errorData) => <ErrorPage {...errorData} />}
      >
        <RootAccounts />
      </Sentry.ErrorBoundary>
    ),

    children: [
      {
        path: '/',
        element: <div>route /</div>,
      },
    ],
  },
];
