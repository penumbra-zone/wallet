import { ModalWrapper } from '../../ModalWrapper';
import { PopupButton } from '../../PopupButton';
import { AccountDetailSvg, PermissionsSvg } from '../../Svg';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

type MoreModalProps = {
  handleConnectedSites: () => void;
  handleAccountDetail: () => void;
};

export const MoreModal: React.FC<SuccessCreateModalProps & MoreModalProps> = ({
  show,
  onClose,
  handleAccountDetail,
  handleConnectedSites,
}) => {
  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="py-[16px] px-[0px] w-[244px]"
    >
      <div className="flex flex-col">
        <PopupButton
          onClick={handleAccountDetail}
          svg={<AccountDetailSvg />}
          text="Account details"
        />
        <PopupButton
          onClick={handleConnectedSites}
          svg={<PermissionsSvg />}
          text="Connected sites"
        />
      </div>
    </ModalWrapper>
  );
};
