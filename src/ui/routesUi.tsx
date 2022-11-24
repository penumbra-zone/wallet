import { RouteObject } from 'react-router-dom';
import { routesPath } from '../utils';
import { SettingsExtensionSideBar, SettingSideBar } from './components';
import {
  BalanceDetail,
  Login,
  Main,
  Settings,
  SettingsExtenion,
  SettingsNetworks,
  SettingsSecurityPrivacy,
} from './containers';
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
      {
        path: routesPath.BALANCE_DETAIL,
        element: <BalanceDetail />,
      },
      {
        path: routesPath.SETTINGS,
        element: <SettingsExtenion />,
        children: [
          {
            path: routesPath.SETTINGS,
            element: <SettingsExtensionSideBar />,
          },
          {
            path: routesPath.SETTINGS_SUPPORT,
            element: <h2>SUPPORT</h2>,
          },
          {
            path: routesPath.SETTINGS_ADDITIONALLY,
            element: <h2>SETTINGS_ADDITIONALLY</h2>,
          },
          {
            path: routesPath.SETTINGS_CONTACTS,
            element: <h2>SETTINGS_CONTACTS</h2>,
          },
          {
            path: routesPath.SETTINGS_SECURITY_PRIVACY,
            element: <SettingsSecurityPrivacy />,
          },
          {
            path: routesPath.SETTINGS_WARNINGS,
            element: <h2>SETTINGS_WARNINGS</h2>,
          },
          {
            path: routesPath.SETTINGS_NETWORKS,
            element: <SettingsNetworks />,
          },
          {
            path: routesPath.SETTINGS_GENERAL_INFORMATION,
            element: <h2>SETTINGS_GENERAL_INFORMATION</h2>,
          },
        ],
      },
    ],
  },
];
