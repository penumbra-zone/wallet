import { useState } from 'react';

import Background from '../../services/Background';
import { useAppDispatch } from '../../../accounts';
import {
  Button,
  CheckBox,
  ChevronLeftIcon,
  Input,
  Logo,
} from '../../components';

type CreatePasswordProps = {};

export const CreatePassword: React.FC<CreatePasswordProps> = ({}) => {
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleClickShowPassword = () => setShowPassword((state) => !state);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(event.target.value);

  const handleSubmitPassword = async () => Background.initVault(password);

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[400px] flex flex-col items-center justify-center">
        <div className="self-start">
          <Button
            mode="icon_transparent"
            onClick={() => console.log('asd')}
            title="Back"
            iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
          />
        </div>
        <p className="h1 mt-[40px] mb-[24px]">First time on Penumbra?</p>
        <div className="w-[100%]">
          <Input
            label="New Password"
            placeholder="Password"
            helperText="Password is not long enough"
            isError={!!password}
            value={password}
            onChange={handleChangePassword}
            type="password"
          />
        </div>
        <div className="w-[100%]">
          <Input
            label="Confirm password"
            placeholder="Confirm password"
            helperText="Password is not long enough"
            isError={!!password}
            value={password}
            onChange={handleChangePassword}
            type="password"
          />
        </div>
        <p className="text_body text-light_grey text-left self-start mb-[16px]">
          Must be at least 8 characters
        </p>
        <div className="self-start mb-[40px]">
          <CheckBox label="I have read the terms of use and agree to them" />
        </div>
        <div className="w-[100%]">
          <Button
            title="Create"
            mode="gradient"
            onClick={handleSubmitPassword}
          />
        </div>
      </div>
    </div>
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
    //   <Typography sx={{ fontSize: '18px' }}>Create password</Typography>
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
    //   {false && (
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
