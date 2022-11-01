import { ModalWrapper } from '../../ModalWrapper';
import { PopupButton } from '../../PopupButton';
import { AccountDetailModal } from '../AccountDetailModal';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

export const MoreModal: React.FC<
  SuccessCreateModalProps & { handleAccountDetail: () => void }
> = ({ show, onClose, handleAccountDetail }) => {
  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="pt-[24px] pb-[42px] px-[0px] w-[244px]"
    >
      <div className="flex flex-col">
        <div className="">
          <PopupButton
            onClick={handleAccountDetail}
            svg={
              <div className="w-[8px] h-[8px] bg-[#608E84] rounded-[50%] mr-[8px]"></div>
            }
            text="Account details"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
