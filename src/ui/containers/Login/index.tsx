import { useState } from 'react';
import { Button, Input } from '../../components';
import Background from '../../services/Background';

type LoginProps = {};

export const Login: React.FC<LoginProps> = ({}) => {
  const [password, setPassword] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setIsError(false);
  };

  const handleSubmitPassword = async () => {
    try {
      await Background.unlock(password);
      await Background.getCompactBlockRange();
    } catch {
      setIsError(true);
    }
  };

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[400px] flex flex-col items-center justify-center">
        <p className="h1">Welcome back!</p>
        <p className="text _body text-light_grey mb-[40px] mt-[16px]">
          A decentralized network awaits
        </p>
        <div className="w-[100%] mb-[24px]">
          <Input
            label="New Password"
            placeholder="Password"
            isError={isError}
            helperText="Incorrect password"
            value={password}
            onChange={handleChangePassword}
            customType="password"
          />
        </div>
        <div className="w-[100%] mb-[60px] mt-[40px]">
          <Button
            title="Unlock"
            mode="gradient"
            onClick={handleSubmitPassword}
            disabled={!password}
          />
        </div>
        <p className="text _body text-light_grey">
          Need help? Contact Penumbra support
        </p>
      </div>
    </div>
  );
};
