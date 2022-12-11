import { ChangeEvent, useEffect, useState } from 'react';
import { PermissionType } from '../../../../controllers';
import { ModalWrapper } from '../../ModalWrapper';
import { Tabs } from '../../Tabs';
import { Toogle } from '../../Toogle';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

const lowPermissions = {
  GET_CHAIN_CURRENT_STATUS: 'Get current status of chain',
  GET_NOTES: 'Get notes',
  GET_QUARANTINED_NOTES: 'Get notes that have been quarantined',
  GET_WITNESS: 'Get witness',
  GET_ASSETS: 'Get assets',
  GET_CHAIN_PARAMETERS: 'Get chain parameters',
  GET_FMD_PARAMETERS: 'Get FMD parameters',
  GET_NOTE_BY_COMMITMENT: 'Get note by note commitment',
  GET_NULLIFIER_STATUS: 'Get nullifier status',
  GET_TRANSACTION_HASHES: 'Get transaction hashes',
  GET_TRANSACTION_BY_HASH: 'Get transaction by hash',
  GET_TRANSACTIONS: 'Get transactions',
  GET_TRANSACTION_PERSPECTIVE: 'Get transactions perspective',
};

export const PermissionsModal: React.FC<
  SuccessCreateModalProps & { permissions: PermissionType[] }
> = ({ show, permissions, onClose }) => {
  const [currentPermissions, setCurrentPermissions] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const obj = {};
    Object.keys(lowPermissions).forEach((i: PermissionType) => {
      obj[i] = permissions.includes(i);
    });
    setCurrentPermissions(obj);
  }, []);

  const handleChange =
    (type: PermissionType) => (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentPermissions((state) => ({
        ...state,
        [type]: e.target.checked,
      }));
    };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="pt-[24px] pb-[42px] px-[0px] w-[320px] h-[400px] overflow-y-auto"
    >
      <div className="flex flex-col px-[16px]">
        <Tabs
          tabs={['Low', 'High']}
          className="text_button_ext bg-brown"
          children={(type) =>
            type === 'Low' ? (
              <>
                {Object.keys(lowPermissions).map((i: PermissionType) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between pb-[6px] pt-[22px] border-b-[1px] border-solid border-dark_grey"
                    >
                      <p className="h2_ext mr-[32px]">{lowPermissions[i]}</p>
                      <Toogle
                        checked={currentPermissions[i]}
                        handleChange={handleChange(i)}
                      />
                    </div>
                  );
                })}
              </>
            ) : (
              <></>
            )
          }
        />
      </div>
    </ModalWrapper>
  );
};
