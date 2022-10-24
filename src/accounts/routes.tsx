import { RouteObject } from 'react-router-dom';
import { RootAccounts } from '../ui/RootAccounts';

export const routes: RouteObject[] = [
  {
    element: <RootAccounts />,

    children: [
      {
        path: '/',
        element: <div>route /</div>,
      },
    ],
  },
];
