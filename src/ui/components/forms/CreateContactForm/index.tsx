import React, { useState } from 'react';
import { Contact } from '../../../../controllers';
import { useMediaQuery } from '../../../../hooks';
import { AddressValidatorsType, validateAddress } from '../../../../utils';
import Background from '../../../services/Background';
import { Button } from '../../Button';
import { Input } from '../../Input';

type CreateContactFormProps = {
  handleCancel: () => void;
};

export const CreateContactForm: React.FC<CreateContactFormProps> = ({
  handleCancel,
}) => {
  const isDesktop = useMediaQuery();
  const [values, setValues] = useState<Contact>({
    name: '',
    address: '',
  });

  const [isValidate, setIsValidate] = useState<AddressValidatorsType>(
    {} as AddressValidatorsType
  );

  const handleChangeValues =
    (type: 'name' | 'address') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((state) => ({
        ...state,
        [type]: event.target.value,
      }));

      if (type === 'address') {
        const validators = validateAddress(event.target.value);
        setIsValidate((state) => ({
          ...state,
          ...validators,
        }));
        if (!event.target.value) setIsValidate({} as AddressValidatorsType);
      }
    };

  const handleSave = async () => {
    await Background.setContact(values);
    handleCancel();
  };

  return (
    <div className="w-[100%] h-[100%] px-[16px] ext:pt-[24px] ext:pb-[32px] tablet:py-[24px] flex flex-col justify-between">
      <div className="flex flex-col">
        <Input
          label={<p className={`${isDesktop ? 'h3' : 'h2_ext'}`}>User name</p>}
          value={values.note}
          onChange={handleChangeValues('name')}
          className="mb-[24px]"
        />
        <Input
          label={
            <p className={`${isDesktop ? 'h3' : 'h2_ext'}`}>
              Penumbra's address
            </p>
          }
          isError={Object.values(isValidate).includes(false)}
          helperText="Invalid address"
          value={values.address}
          onChange={handleChangeValues('address')}
        />
      </div>
      <div className="w-[100%] flex">
        <Button
          mode="transparent"
          onClick={handleCancel}
          title="Cancel"
          className="w-[50%] mr-[8px]"
        />
        <Button
          mode="gradient"
          onClick={handleSave}
          title="Save"
          className="w-[50%] ml-[8px]"
          disabled={
            !(
              values.address &&
              values.name &&
              !Object.values(isValidate).includes(false)
            )
          }
        />
      </div>
    </div>
  );
};
