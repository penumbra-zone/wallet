import { observer } from 'mobx-react';
import { useEffect } from 'react';

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { routes } from '../utils';
import {
  CreatePassword,
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
  const location = useLocation();
  const { keys, initialized, locked, isWrongPass } = background.state;
  const { unlock, initVault, addKey } = background;
  console.log({ location });

  //firstly - redirect to /select-action
  useEffect(() => {
    if (initialized === undefined) return;
    if (!initialized) {
      return navigate(routes.INITIALIZE_SELECT_ACTION);
    }
  }, [initialized]);

  useEffect(() => {
    if (locked === undefined || !initialized) return;
    if (locked) {
      return navigate(routes.INITIALIZE_CREATE_PASSWORD);
    } else {
      return navigate(keys[1] ? routes.HOME : routes.INITIALIZE_SEED_PHRASE);
    }
  }, [locked, initialized, keys]);
  console.log({ initialized });

  if (locked === undefined) return <></>;

  return (
    <Routes>
      <Route path={routes.HOME} element={<Main />} />
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
    </Routes>
    // <Box
    //   sx={{
    //     height: '100%',
    //     width: '100%',
    //   }}
    // >
    //   {locked ? (
    //     <Password
    //       password={password}
    //       handleChange={handleChangePassword}
    //       handleSubmitPassword={handleSubmitPassword}
    //       isWrongPass={isWrongPass}
    //       isInitialize={initialized}
    //     />
    //   ) : (
    //     <>
    //       {!keys[1] ? (
    //         <>
    //           {!isCheckSeed ? (
    //             <GenerateSeedPhrase
    //               mnemonic={keys[0].data}
    //               handleNext={handleNext}
    //             />
    //           ) : (
    //             <CheckSeedPhrase mnemonic={keys[0].data} addKey={addKey} />
    //           )}
    //         </>
    //       ) : (
    //         <Box sx={{ width: '100px' }}>
    //           <Typography sx={{ fontSize: '24px' }}>
    //             SpendingKey:{' '}
    //             {`${keys[1].spendKey[0]}${keys[1].spendKey[1]}${
    //               keys[1].spendKey[2]
    //             }${keys[1].spendKey[3]}...${
    //               keys[1].spendKey[keys[1].spendKey.length - 3]
    //             }${keys[1].spendKey[keys[1].spendKey.length - 2]}${
    //               keys[1].spendKey[keys[1].spendKey.length - 1]
    //             }`}
    //           </Typography>
    //         </Box>
    //       )}
    //     </>
    //   )}
    // </Box>
  );
});

// <>
//   {!initialized ? (
//     <Initialize onInit={initVault} />
//   ) : locked ? (
//     <Unlock onUnlock={unlock} />
//   ) : messages.length > 0 ? (
//     <Sign
//       keys={keys}
//       message={messages[messages.length - 1]}
//       onApprove={approve}
//       onReject={reject}
//     />
//   ) : (
//     <Keys keys={keys} onAdd={addKey} onRemove={removeKey} />
//   )}
//   <div>
//     {!locked && <button onClick={() => lock()}>Lock App</button>}
//     {initialized && (
//       <button onClick={() => deleteVault()}>
//         Delete all keys and init
//       </button>
//     )}
//   </div>
// </>
