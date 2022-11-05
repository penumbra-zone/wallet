import { useAccountsSelector } from '../../../../accounts';
import { selectSelectedAccount } from '../../../redux';
import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { SettingsSvg, SupportSvg } from '../../Svg';
import { UserLogo } from '../../UserLogo';
import { SuccessCreateModalProps } from '../SuccessCreateModal';
import Background from '../../../services/Background';
import { PopupButton } from '../../PopupButton';
import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../../utils';

export const AccountModal: React.FC<SuccessCreateModalProps> = ({
  show,
  onClose,
}) => {
  const navigate = useNavigate();
  const selectedAccount = useAccountsSelector(selectSelectedAccount);

  const handleBlock = async () => {
    await Background.lock();
    onClose();
  };

  const handleSettings = () => {
    onClose();
    navigate(routesPath.SETTINGS);
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="top_right"
      className="py-[20px] px-[0px]"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-[18px] pb-[24px] border-b-[1px] border-solid border-dark_grey">
          <p className="h1_ext mr-[8px]">My accounts</p>
          <div className="w-[119px]">
            <Button
              title="Block"
              mode="gradient"
              onClick={handleBlock}
              className="py-[7px]"
            />
          </div>
        </div>
        <div className="flex items-center py-[20px] px-[18px] border-b-[1px] border-solid border-dark_grey">
          <UserLogo className="w-[42px] h-[42px]" />
          <div className="flex flex-col items-center  ml-[4px]">
            <p className="h1_ext">{selectedAccount.name}</p>
            <p className="text_numbers">0 PNB</p>
          </div>
        </div>
        <div className="pt-[24px]">
          <PopupButton svg={<SupportSvg />} text="Support" />
          <PopupButton
            svg={<SettingsSvg />}
            text="Settings"
            onClick={handleSettings}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
