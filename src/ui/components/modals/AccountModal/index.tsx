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
import { useMediaQuery } from '../../../../hooks';
import { Balance } from '../../Balance';

export const AccountModal: React.FC<SuccessCreateModalProps> = ({
  show,
  onClose,
}) => {
  const isDesktop = useMediaQuery();
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
      position={isDesktop ? 'top_right' : 'center'}
      className="py-[30px] px-[0px]"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-[16px] pb-[16px] border-b-[1px] border-solid border-dark_grey">
          <p className="h1_ext mr-[8px]">My accounts</p>
          <div className="w-[119px]">
            <Button
              title="Block"
              mode="gradient"
              onClick={handleBlock}
              className="tablet:py-[7px]"
            />
          </div>
        </div>
        <div className="flex items-center py-[16px] px-[16px] border-b-[1px] border-solid border-dark_grey">
          <UserLogo className="w-[36px] h-[36px]" />
          <div className="flex flex-col items-center  ml-[4px]">
            <p className="h2_ext">{selectedAccount.name}</p>
            <Balance className="text_numbers_ext" />
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
