import { useState } from 'react';
import Background from '../../../services/Background';
import { Button } from '../../Button';
import { Input } from '../../Input';
import { ModalWrapper } from '../../ModalWrapper';

export type CreateContactModalProps = {
  show: boolean;
  onClose: () => void;
  address: string;
};

export const CreateContactModal: React.FC<CreateContactModalProps> = ({
  show,
  address,
  onClose,
}) => {
  const [nickname, setNickname] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setIsError(false);
  };

  const handleSave = async () => {
    try {
      await Background.setContact({ name: nickname, address });
      onClose();
    } catch (error) {
      setIsError(true);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      className="py-[20px] px-[16px] w-[300px]"
    >
      <div className="flex flex-col">
        <p className="h1_ext mb-[24px]">Add nickname</p>
        <div className="relative w-[36px] h-[36px] bg-brown rounded-[50%] li_gradient before:content-[''] before:absolute before:top-[0.5px] before:left-[0.5px] before:block before:w-[calc(100%-1px)] before:h-[calc(100%-1px)] before:bg-brown before:rounded-[50%]"></div>
        <p className="h2_ext mt-[12px] mb-[8px]">Address</p>
        <div className="w-[100%] relative input_default_border p-[1px] rounded-[15px]">
          <p className="break-all bg-brown text-light_grey rounded-[15px] text_body_ext py-[10px] px-[12px]">
            {address}
          </p>
        </div>
        <Input
          labelClassName="h2_ext mb-[8px]"
          label="Nickname"
          value={nickname}
          onChange={handleChangeNickname}
          isError={isError}
          helperText="Contact with this name exist"
          className="mt-[24px]"
        />
        <div className="w-[100%] flex mt-[18px]">
          <Button
            mode="transparent"
            onClick={onClose}
            title="Cancel"
            className="w-[50%] mr-[8px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px]"
          />
          <Button
            mode="gradient"
            onClick={handleSave}
            title="Save"
            className="w-[50%] ml-[8px] ext:pt-[7px] tablet:pt-[7px] ext:pb-[7px] tablet:pb-[7px]"
            disabled={!nickname}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
