import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import { useState } from 'react';
import { CheckSeedPhrase, GenerateSeedPhrase, Password } from './containers';
import Typography from '@mui/material/Typography';

type AppProps = {
  background: any;
};

export const App: React.FC<AppProps> = observer(({ background }) => {
  const { keys, initialized, locked, isWrongPass } = background.state;
  const { unlock, initVault, addKey } = background;
  const [password, setPassword] = useState<string>('');
  const [isCheckSeed, setIsCheckSeed] = useState<boolean>(false);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleSubmitPassword = () =>
    initialized ? unlock(password) : initVault(password);

  const handleNext = () => setIsCheckSeed(true);

  if (locked === undefined) return <></>;

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      {locked ? (
        <Password
          password={password}
          handleChange={handleChangePassword}
          handleSubmitPassword={handleSubmitPassword}
          isWrongPass={isWrongPass}
          isInitialize={initialized}
        />
      ) : (
        <>
          {!keys[1] ? (
            <>
              {!isCheckSeed ? (
                <GenerateSeedPhrase
                  mnemonic={keys[0].data}
                  handleNext={handleNext}
                />
              ) : (
                <CheckSeedPhrase mnemonic={keys[0].data} addKey={addKey} />
              )}
            </>
          ) : (
            <Box sx={{ width: '100px' }}>
              <Typography sx={{ fontSize: '24px' }}>
                SpendingKey:{' '}
                {`${keys[1].spendKey[0]}${keys[1].spendKey[1]}${
                  keys[1].spendKey[2]
                }${keys[1].spendKey[3]}...${
                  keys[1].spendKey[keys[1].spendKey.length - 3]
                }${keys[1].spendKey[keys[1].spendKey.length - 2]}${
                  keys[1].spendKey[keys[1].spendKey.length - 1]
                }`}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
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
