import Background from '../../services/Background';
import { Button, ChevronLeftIcon, CreatePasswordForm } from '../../components';
import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';

type CreatePasswordProps = {};

export const CreatePassword: React.FC<CreatePasswordProps> = ({}) => {
  const navigate = useNavigate();

  const handleBack = () => navigate(routesPath.SELECT_ACTION);

  const handleSubmitPassword = (password: string) => async () =>
    Background.initVault(password);

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[100%] flex flex-col items-center justify-center">
        <div className="self-start">
          <Button
            mode="icon_transparent"
            onClick={handleBack}
            title="Back"
            iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
          />
        </div>
        <p className="h1 mt-[40px] mb-[24px]">Create password</p>
        <CreatePasswordForm
          buttonTitle="Create"
          onClick={handleSubmitPassword}
        />
      </div>
    </div>
  );
};
