import { RouteObject } from 'react-router-dom';
import { routesPath } from '../utils';
import { Login, Main } from './containers';
import { RootUi } from './RootUi';


export const routesUi: RouteObject[] = [
  {
    element: <RootUi />,

    children: [
      {
        path: routesPath.HOME,
        element: <Main />,
      },
      {
        path: routesPath.LOGIN,
        element: <Login />,
      },
    ],
  },
];
