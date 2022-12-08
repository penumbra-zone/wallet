import { useState } from 'react';
import { AccountDetailModal } from '../modals/AccountDetailModal';
import { ConnectedSitesModal } from '../modals/ConnectedSitesModal';
import { ExportKeyModal } from '../modals/ExportKeyModal';
import { MoreModal } from '../modals/MoreModal';
import { DotsSvg } from '../Svg';

export type KeysModalType = '' | 'full_viewing_key' | 'spending_key';

export const MorePopupButton = () => {
  const [isOpenMorePopup, setIsOpenMorePopup] = useState<boolean>(false);
  const [isOpenDetailPopup, setIsOpenDetailPopup] = useState<boolean>(false);
  const [isOpenConnectedSites, setIsOpenConnectedSites] =
    useState<boolean>(false);
  const [keyModalType, setKeyModalType] = useState<KeysModalType>('');

  const toggleMorePopup = (value: boolean) => () => setIsOpenMorePopup(value);

  const toggleDetailPopup = (value: boolean) => () =>
    setIsOpenDetailPopup(value);

  const toggleConnectedSitesPopup = (value: boolean) => () =>
    setIsOpenConnectedSites(value);

  const handleAccountDetail = () => {
    setIsOpenMorePopup(false);
    setIsOpenDetailPopup(true);
  };

  const handleConnectedSites = () => {
    setIsOpenMorePopup(false);
    setIsOpenConnectedSites(true);
  };

  const changeKeyModalType = (type: KeysModalType) => () => {
    setKeyModalType(type);
    setIsOpenDetailPopup(false);
  };

  const handleBackExportPopup = () => {
    setIsOpenDetailPopup(true);
    setKeyModalType('');
  };
  return (
    <>
      <div
        className="absolute ext:right-[24px] ext:top-[28px] tablet:right-[30px] tablet:top-[34px] cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={toggleMorePopup(true)}
      >
        <DotsSvg />
      </div>
      <MoreModal
        show={isOpenMorePopup}
        onClose={toggleMorePopup(false)}
        handleAccountDetail={handleAccountDetail}
        handleConnectedSites={handleConnectedSites}
      />
      <AccountDetailModal
        show={isOpenDetailPopup}
        onClose={toggleDetailPopup(false)}
        changeKeyModalType={changeKeyModalType}
      />
      <ExportKeyModal
        type={keyModalType}
        show={Boolean(keyModalType)}
        onClose={changeKeyModalType('')}
        handleBack={handleBackExportPopup}
      />
      <ConnectedSitesModal
        show={isOpenConnectedSites}
        onClose={toggleConnectedSitesPopup(false)}
      />
    </>
  );
};
