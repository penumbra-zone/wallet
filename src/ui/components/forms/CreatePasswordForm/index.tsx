import React, { useState } from 'react';
import { PasswordValidatorsType, validatePassword } from '../../../../utils';
import { Button } from '../../Button';
import { CheckBox } from '../../CheckBox';
import { Input } from '../../Input';
import { PasswordRules } from '../../PasswordRules';

type CreatePasswordFormProps = {
  buttonTitle: string;
  onClick: (password: string) => () => Promise<void>;
};

export const CreatePasswordForm: React.FC<CreatePasswordFormProps> = ({
  buttonTitle,
  onClick,
}) => {
  const [password, setPassword] = useState<{
    newPass: string;
    confirmPass: string;
  }>({
    // newPass: '1qazXsw@',
    // confirmPass: '1qazXsw@',
    newPass: '',
    confirmPass: ''
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

  const handleKeyPressCheckBox = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsChecked((state) => !state);
    }
  };

  return (
    <div>
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
          onKeyDown={handleKeyPressCheckBox}
        />
      </div>
      <div className="w-[100%] mb-[30px]">
        <Button
          title={buttonTitle}
          mode="gradient"
          disabled={
            !(
              Boolean(Object.values(isValidate).length) &&
              !Object.values(isValidate).includes(false) &&
              password.confirmPass === password.newPass &&
              isChecked
            )
          }
          onClick={onClick(password.newPass)}
        />
      </div>
    </div>
  );
};
