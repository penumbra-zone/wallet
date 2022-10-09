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

type PasswordProps = {
  password: string;
  handleChangeStep: () => void;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Password: React.FC<PasswordProps> = ({
  password,
  handleChange,
  handleChangeStep,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

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
      <Typography sx={{ fontSize: '18px' }}>Create password</Typography>
      <FormControl sx={{ width: '100%', marginY: '10px' }} variant="outlined">
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handleChange}
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
      <Button
        variant="contained"
        disabled={!password}
        onClick={handleChangeStep}
      >
        Submit
      </Button>
    </Box>
  );
};
