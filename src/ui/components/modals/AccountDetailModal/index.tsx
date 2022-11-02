import { useAccountsSelector } from '../../../../accounts';
import { KeysModalType } from '../../../containers';
import { selectSelectedAccount } from '../../../redux';
import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { UserLogo } from '../../UserLogo';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

type AccountDetailModalProps = {
  changeKeyModalType: (key: KeysModalType) => () => void;
};

export const AccountDetailModal: React.FC<
  SuccessCreateModalProps & AccountDetailModalProps
> = ({ show, onClose, changeKeyModalType }) => {
  const selectedAccount = useAccountsSelector(selectSelectedAccount);

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="pt-[30px] pb-[52px] px-[0px] w-[335px]"
    >
      <div>
        <div className="flex flex-col items-center border-b-[1px] border-solid border-dark_grey pb-[24px]">
          <UserLogo />
          <p className="h2 mt-[12px] mb-[40px]">{selectedAccount.name}</p>
          <div className="w-[100%] px-[31px]">
            <div className="px-[16px] py-[8px] rounded-[15px] bg-dark_grey break-words">
              {selectedAccount.addressByIndex}
            </div>
          </div>
        </div>
        <div className="pt-[60px] px-[31px]">
          <Button
            title="Export full viewing key"
            mode="gradient"
            onClick={changeKeyModalType('full_viewing_key')}
            className="w-[100%] py-[7px]"
          />
          <Button
            title="Export spending key"
            mode="gradient"
            onClick={changeKeyModalType('spending_key')}
            className="w-[100%] py-[7px] mt-[24px]"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
