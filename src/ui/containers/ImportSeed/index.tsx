import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState } from 'react';
import {
  generate_spend_key,
  get_full_viewing_key,
} from 'penumbra-web-assembly';
import { BackgroundType } from '../../../types';

type ImportSeedProps = {
  background: BackgroundType;
};

export const ImportSeed: React.FC<ImportSeedProps> = ({ background }) => {
  const { initVault, addKey } = background;
  const [password, setPassword] = useState<string>('');
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleChangeSeed = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSeedPhrase(event.target.value);

  const handleImport = () => {
    initVault(password, seedPhrase);
    const spendKey = generate_spend_key(seedPhrase);
    const fvk = get_full_viewing_key(spendKey);
    addKey([{ spendKey, fvk }]);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingX: '5px',
      }}
    >
      <Typography sx={{ fontSize: '18px' }}>Import Wallet</Typography>
      <FormControl sx={{ width: '100%', marginY: '10px' }} variant="outlined">
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handleChangePassword}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
      <FormControl sx={{ width: '100%', marginY: '10px' }} variant="outlined">
        <InputLabel htmlFor="outlined-adornment-mnemonic">
          Seed Phrase
        </InputLabel>
        <OutlinedInput
          id="outlined-adornment-mnemonic"
          type="text"
          value={seedPhrase}
          onChange={handleChangeSeed}
          label="Seed phrase"
        />
      </FormControl>
      <Button
        variant="contained"
        disabled={!password || !seedPhrase}
        onClick={handleImport}
      >
        Import
      </Button>
    </Box>
  );
};
