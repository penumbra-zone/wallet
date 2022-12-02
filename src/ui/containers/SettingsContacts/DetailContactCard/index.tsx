import { Dispatch, SetStateAction, useState } from 'react';
import { Contact } from '../../../../controllers';
import { useMediaQuery } from '../../../../hooks';
import toast from 'react-hot-toast';
import Background from '../../../services/Background';
import { Button, CopySvg, Input } from '../../../components';
import { AddressValidatorsType, validateAddress } from '../../../../utils';

type DetailContactCardProps = {
  contact: Contact;
  handleCancel: () => void;
  setSelectedContact: Dispatch<SetStateAction<Contact | null>>;
};

export const DetailContactCard: React.FC<DetailContactCardProps> = ({
  contact,
  handleCancel,
  setSelectedContact,
}) => {
  const isDesktop = useMediaQuery();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [values, setValues] = useState<Contact>(contact);
  const [isValidate, setIsValidate] = useState<AddressValidatorsType>(
    {} as AddressValidatorsType
  );

  const handleEdit = () => setIsEdit(true);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contact.address);
    toast.success('Success copied!', {
      position: 'top-right',
    });
  };

  const handleChangeValues =
    (type: 'name' | 'address' | 'note') =>
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

  const handleCancelBtn = () => setIsEdit(false);

  const handleDelete = () => {
    Background.removeContact(contact.address);
    handleCancel();
    setSelectedContact(null);
    setIsEdit(false);
  };

  const handleSave = () => {
    Background.updateContact(values, contact.address);
    handleCancel();
    setSelectedContact(null);
    setIsEdit(false);
  }

  return (
    <div className="py-[24px] w-[100%] flex flex-col px-[16px]">
      <div className="flex items-center justify-between mb-[16px]">
        <div className="ext:w-[40px] ext:h-[40px] tablet:w-[52px] tablet:h-[52px] li_gradient rounded-[50%] flex items-center justify-center">
          <div className="ext:w-[39px] ext:h-[39px] tablet:w-[51px] tablet:h-[51px] bg-brown rounded-[50%] flex items-center justify-center"></div>
        </div>
        {isEdit && (
          <Button
            title="Delete"
            mode="gradient"
            onClick={handleDelete}
            className="w-[152px] tablet:py-[7px]"
          />
        )}
      </div>
      {!isEdit ? (
        <p className={`mb-[24px] ${isDesktop ? 'h3' : 'h2_ext'}`}>
          {contact.name}
        </p>
      ) : (
        <Input
          label={<p className={`${isDesktop ? 'h3' : 'h2_ext'}`}>User name</p>}
          value={values.name}
          onChange={handleChangeValues('name')}
          className="mb-[24px]"
        />
      )}
      {!isEdit && (
        <Button
          title="Edit"
          mode="gradient"
          onClick={handleEdit}
          className="tablet:w-[100%] mb-[24px]"
        />
      )}
      {!isEdit ? (
        <div className="flex flex-col mb-[24px]">
          <p className="text_body mb-[16px]">Penumbra's address</p>
          <div className="flex items-center py-[8px] ext:px-[16px] tablet:px-[10px] bg-dark_grey rounded-[15px]">
            <p className="break-all text_body mr-[10px]">{contact.address}</p>
            <span
              className=" cursor-pointer svg_hover"
              onClick={copyToClipboard}
              role="button"
              tabIndex={0}
            >
              <CopySvg width="20" height="20" fill="#524B4B" />
            </span>
          </div>
        </div>
      ) : (
        <Input
          label={
            <p className={`${isDesktop ? 'h3' : 'h2_ext'}`}>
              Penumbra's address
            </p>
          }
          value={values.address}
          onChange={handleChangeValues('address')}
          className="-mb-[6px]"
          isError={Object.values(isValidate).includes(false)}
          helperText="Invalid address"
        />
      )}

      {!isEdit ? (
        <>
          {contact.note && (
            <div className="flex flex-col mb-[24px]">
              <p className="text_body mb-[16px]">Note</p>
              <div className="flex items-center py-[8px] ext:px-[16px] tablet:px-[10px] bg-dark_grey rounded-[15px]">
                <p className="break-all text_body">{contact.note}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <Input
          label={<p className={`${isDesktop ? 'h3' : 'h2_ext'}`}>Note</p>}
          value={values.note}
          onChange={handleChangeValues('note')}
          className="mb-[24px]"
        />
      )}
      {isEdit && (
        <div className="w-[100%] flex mt-[72px]">
          <Button
            mode="transparent"
            onClick={handleCancelBtn}
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
      )}
    </div>
  );
};
