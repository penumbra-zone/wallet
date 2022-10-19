import { observer } from 'mobx-react';
import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { getAssets, getChainParams, routes } from '../utils';
import {
  CreatePassword,
  ImportSeed,
  Main,
  SeedPhrase,
  SeedPhraseConfirm,
  SelectAction,
} from './containers';

type AppProps = {
  background: any;
};

export const App: React.FC<AppProps> = observer(({ background }) => {
  const navigate = useNavigate();
  const { keys, initialized, locked } = background.state;

  useEffect(() => {
    if (initialized === undefined) return;
    if (!initialized) return navigate(routes.INITIALIZE_SELECT_ACTION);
    else {
      if (locked) return navigate(routes.INITIALIZE_CREATE_PASSWORD);
      else {
        if (keys[1]) return navigate(routes.HOME);
        else return navigate(routes.INITIALIZE_SEED_PHRASE);
      }
    }
  }, [initialized, locked, keys]);

  useEffect(() => {
    if (keys && keys[1]) {
      getAssets();
      getChainParams();
    }
  }, [keys]);

  if (locked === undefined) return <></>;

  return (
    <Routes>
      <Route path={routes.HOME} element={<Main background={background} />} />
      <Route
        path={routes.INITIALIZE_SELECT_ACTION}
        element={<SelectAction />}
      />

      <Route
        path={routes.INITIALIZE_CREATE_PASSWORD}
        element={<CreatePassword background={background} />}
      />
      <Route
        path={routes.INITIALIZE_SEED_PHRASE}
        element={<SeedPhrase background={background} />}
      />
      <Route
        path={routes.INITIALIZE_SEED_PHRASE_CONFIRM}
        element={<SeedPhraseConfirm background={background} />}
      />
      <Route
        path={routes.INITIALIZE_IMPORT_SEED}
        element={<ImportSeed background={background} />}
      />
    </Routes>
  );
});
