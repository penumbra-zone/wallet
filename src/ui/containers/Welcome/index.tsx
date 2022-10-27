import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { Button, Logo } from '../../components';

export const Welcome = () => {
  const navigate = useNavigate();

  const handleStart = () => navigate(routesPath.SELECT_ACTION);

  return (
    <div className="w-[100%] min-h-[100vh] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <Logo size="big" />
        <p className="h1 mt-[40px] mb-[16px]">Welcome to Penumbra</p>
        <p className="text_body text-light_grey">
          Connecting you to Penumbra and the decentralized web...
        </p>
        <p className="text_body text-light_grey mt-[6px] mb-[42px]">
          We're glad to see you.
        </p>
        <div className="w-[192px]">
          <Button title="Get start" mode="gradient" onClick={handleStart} />
        </div>
      </div>
    </div>
  );
};
