import { observer } from 'mobx-react';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  CheckSeedPhrase,
  CreateOrRecoveryWallet,
  GenerateSeedPhrase,
  Password,
} from './containers';
import { getSeedPhrase } from '../utils/getSeedPhrase';
import { generateSpendKey } from 'penumbra-web-assembly';

type Steps = 1 | 2 | 3 | 4;

type AppProps = {
  background: any;
};

export const App: React.FC<AppProps> = observer(({ background }) => {
  // const { keys, messages, initialized, locked, vault, password } = background.state;
  // const { lock, unlock,addKey,removeKey,initVault,deleteVault, approve,reject } = background;
  const [step, setStep] = useState<Steps>(1);
  const [password, setPassword] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  useEffect(() => {
    if (!password || step !== 3) return;
    const mnemonic = getSeedPhrase();
    setMnemonic(mnemonic);
  }, [password, step]);

  useEffect(() => {
    if (!mnemonic) return;
    const spendKey = generateSpendKey(mnemonic);
    console.log({ spendKey });
  }, [mnemonic]);

  const handleChangeStep = (step: Steps) => () => setStep(step);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      {step === 1 && (
        <CreateOrRecoveryWallet handleChangeStep={handleChangeStep(2)} />
      )}
      {step === 2 && (
        <Password
          password={password}
          handleChange={handleChangePassword}
          handleChangeStep={handleChangeStep(3)}
        />
      )}
      {mnemonic && step === 3 && (
        <GenerateSeedPhrase
          mnemonic={mnemonic}
          handleChangeStep={handleChangeStep(4)}
        />
      )}
      {step === 4 && mnemonic && <CheckSeedPhrase mnemonic={mnemonic} />}
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
