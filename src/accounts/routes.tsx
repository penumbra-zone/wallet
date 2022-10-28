import { RouteObject } from 'react-router-dom';
import {
  CreatePassword,
  ImportSeed,
  Login,
  Rules,
  SeedPharseRules,
  SeedPhrase,
  SeedPhraseConfirm,
  SelectAction,
  Welcome,
} from '../ui/containers';
import { RootAccounts } from './RootAccounts';
import { routesPath } from '../utils';

export const routes: RouteObject[] = [
  {
    element: <RootAccounts />,

    children: [
      {
        path: routesPath.HOME,
        element: <>Account</>,
      },
      {
        path: routesPath.WELCOME,
        element: <Welcome />,
      },
      {
        path: routesPath.RULES,
        element: <Rules />,
      },
      {
        path: routesPath.SELECT_ACTION,
        element: <SelectAction />,
      },
      {
        path: routesPath.CREATE_PASSWORD,
        element: <CreatePassword />,
      },
      {
        path: routesPath.SEED_PHRASE_RULES,
        element: <SeedPharseRules />,
      },
      {
        path: routesPath.SEED_PHRASE,
        element: <SeedPhrase />,
      },
      {
        path: routesPath.CONFIRM_SEED_PHRASE,
        element: <SeedPhraseConfirm />,
      },
      {
        path: routesPath.LOGIN,
        element: <Login />,
      },
      {
        path: routesPath.IMPORT_SEED_PHRASE,
        element: <ImportSeed />,
      },
      {},
    ],
  },
];
