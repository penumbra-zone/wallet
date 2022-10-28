import { useState } from 'react';
import Background from '../../services/Background';
import {
  Button,
  CheckBox,
  ChevronLeftIcon,
  Input,
  PasswordRules,
} from '../../components';
import { useNavigate } from 'react-router-dom';
import {
  PasswordValidatorsType,
  routesPath,
  validatePassword,
} from '../../../utils';

type CreatePasswordProps = {};

export const CreatePassword: React.FC<CreatePasswordProps> = ({}) => {
  const navigate = useNavigate();

  const [password, setPassword] = useState<{
    newPass: string;
    confirmPass: string;
  }>({
    newPass: '',
    confirmPass: '',
  });
  const [isValidate, setIsValidate] = useState<PasswordValidatorsType>(
    {} as PasswordValidatorsType
  );
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const handleChangePassword =
    (type: 'newPass' | 'confirmPass') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword((state) => ({
        ...state,
        [type]: event.target.value,
      }));
      if (type === 'newPass') {
        const validators = validatePassword(event.target.value);
        setIsValidate((state) => ({
          ...state,
          ...validators,
        }));
      }
    };

  const handleChangeCheck = (e: React.ChangeEvent<HTMLInputElement>) =>
    setIsChecked(e.target.checked);

  const handleSubmitPassword = async () =>
    Background.initVault(password.newPass);

  const handleBack = () => navigate(routesPath.SELECT_ACTION);

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[400px] flex flex-col items-center justify-center">
        <div className="self-start">
          <Button
            mode="icon_transparent"
            onClick={handleBack}
            title="Back"
            iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
          />
        </div>
        <p className="h1 mt-[40px] mb-[24px]">Create password</p>
        <div className="w-[100%] mb-[24px]">
          <Input
            label="New Password"
            placeholder="Password"
            isError={Object.values(isValidate).includes(false)}
            value={password.newPass}
            onChange={handleChangePassword('newPass')}
            customType="password"
          />
        </div>
        <div className="w-[100%] mb-[24px]">
          <Input
            label="Confirm password"
            placeholder="Confirm password"
            value={password.confirmPass}
            onChange={handleChangePassword('confirmPass')}
            isError={
              password.confirmPass
                ? password.confirmPass !== password.newPass
                : false
            }
            customType="password"
          />
        </div>
        <PasswordRules password={password.newPass} validates={isValidate} />
        <div className="self-start mb-[40px] mt-[16px]">
          <CheckBox
            label="I have read the terms of use and agree to them"
            onChange={handleChangeCheck}
            checked={isChecked}
          />
        </div>
        <div className="w-[100%] mb-[30px]">
          <Button
            title="Create"
            mode="gradient"
            disabled={
              !(
                Boolean(Object.values(isValidate).length) &&
                !Object.values(isValidate).includes(false) &&
                password.confirmPass === password.newPass &&
                isChecked
              )
            }
            onClick={handleSubmitPassword}
          />
        </div>
      </div>
    </div>
  );
};
