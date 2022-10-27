
import { useState } from 'react';
import { useAppDispatch } from '../../../accounts';
import { createAccount } from '../../redux';
import Background from '../../services/Background';

type ImportSeedProps = {};

export const ImportSeed: React.FC<ImportSeedProps> = ({}) => {
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState<string>('');
  const [seed, setSeed] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleChangeSeed = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSeed(event.target.value);

  const handleSubmit = async () => {
    await Background.initVault(password);
    await dispatch(createAccount({ seed, type: 'seed', name: 'Wallet 1' }));
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
    //   <Typography sx={{ fontSize: '18px' }}>Import Wallet</Typography>
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
    //   <FormControl sx={{ width: '100%', marginY: '10px' }} variant="outlined">
    //     <InputLabel htmlFor="outlined-adornment-mnemonic">
    //       Seed Phrase
    //     </InputLabel>
    //     <OutlinedInput
    //       id="outlined-adornment-mnemonic"
    //       type="text"
    //       value={seed}
    //       onChange={handleChangeSeed}
    //       label="Seed phrase"
    //     />
    //   </FormControl>
    //   <Button
    //     variant="contained"
    //     disabled={!password || !seed}
    //     onClick={handleSubmit}
    //   >
    //     Import
    //   </Button>
    // </Box>
  );
};
