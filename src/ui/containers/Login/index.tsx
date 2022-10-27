import { useState } from 'react';
import { getSeedPhrase } from '../../../utils/getSeedPhrase';
import { BackgroundType } from '../../../types';
import Background from '../../services/Background';

type LoginProps = {};

export const Login: React.FC<LoginProps> = ({}) => {
  // const { isWrongPass, isInitialized } = background.state;
  // const { unlock, initVault } = background;

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleSubmitPassword = async () => {
    try {
      await Background.unlock(password);
    } catch {
      setIsError(true);
    }
  };

  return (<></>
    // <Box
    //   sx={{
    //     width: '100%',
    //     height: '100%',
    //     display: 'flex',
    //     flexDirection: 'column',
    //     alignItems: 'flex-start',
    //     justifyContent: 'center',
    //     paddingX: '5px',
    //   }}
    // >
    //   <Typography sx={{ fontSize: '18px' }}>Enter password</Typography>
    //   <FormControl sx={{ width: '100%', marginY: '10px' }} variant="outlined">
    //     <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
    //     <OutlinedInput
    //       id="outlined-adornment-password"
    //       type={showPassword ? 'text' : 'password'}
    //       value={password}
    //       onChange={handleChangePassword}
    //       endAdornment={
    //         <InputAdornment position="end">
    //           <IconButton
    //             aria-label="toggle password visibility"
    //             onClick={handleClickShowPassword}
    //             edge="end"
    //           >
    //             {showPassword ? <VisibilityOff /> : <Visibility />}
    //           </IconButton>
    //         </InputAdornment>
    //       }
    //       label="Password"
    //     />
    //   </FormControl>
    //   {isError && (
    //     <Typography sx={{ fontSize: '14px', color: 'red' }}>
    //       Wrong password
    //     </Typography>
    //   )}
    //   <Button
    //     variant="contained"
    //     disabled={!password}
    //     onClick={handleSubmitPassword}
    //   >
    //     Submit
    //   </Button>
    // </Box>
  );
};
