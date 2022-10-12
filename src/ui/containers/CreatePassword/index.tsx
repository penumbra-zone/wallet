import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../utils';
import { getSeedPhrase } from '../../../utils/getSeedPhrase';

type CreatePasswordProps = {
  background: any;
};

export const CreatePassword: React.FC<CreatePasswordProps> = ({
  background,
}) => {
  const navigate = useNavigate();

  const { isWrongPass, initialized, keys } = background.state;
  const { unlock, initVault } = background;

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleSubmitPassword = () => {
    if (initialized) {
      unlock(password);
    } else {
      const mnemonic = getSeedPhrase();

      initVault(password, mnemonic);
    }
    navigate(keys[1] ? routes.HOME : routes.INITIALIZE_SEED_PHRASE);
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
      <Typography sx={{ fontSize: '18px' }}>
        {initialized ? 'Enter password' : 'Create password'}
      </Typography>
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
      {isWrongPass && (
        <Typography sx={{ fontSize: '14px', color: 'red' }}>
          Wrong password
        </Typography>
      )}
      <Button
        variant="contained"
        disabled={!password}
        onClick={handleSubmitPassword}
      >
        Submit
      </Button>
    </Box>
  );
};
