import { useState } from 'react';
import {
  Button,
  ExportSeedPhraseModal,
  ResetWalletModal,
} from '../../components';

export const SettingsSecurityPrivacy = () => {
  const [isOpenResetWallet, setIsOpenResetWallet] = useState<boolean>(false);
  const [isOpenSeedModal, setIsOpenSeedModal] = useState<boolean>(true);

  const toggleShowResetWalletModal = (value: boolean) => () =>
    setIsOpenResetWallet(value);

  const toggleShowSeedModal = (value: boolean) => () =>
    setIsOpenSeedModal(value);
  return (
    <>
      <div className="w-[100%] flex flex-col py-[24px] ext:px-[16px] tablet:px-[0px]">
        <div className="flex flex-col pb-[40px]">
          <p className="h3">Show recovery passphrase</p>
          <Button
            title="Show passphrase"
            mode="gradient"
            onClick={toggleShowSeedModal(true)}
            className="ext:w-[100%] tablet:w-[280px] mt-[16px]"
          />
        </div>
        <div className="flex flex-col">
          <p className="h3">Reset wallet</p>
          <Button
            title="Reset wallet"
            mode="gradient"
            onClick={toggleShowResetWalletModal(true)}
            className="ext:w-[100%] tablet:w-[280px] mt-[16px]"
          />
        </div>
      </div>
      <ResetWalletModal
        show={isOpenResetWallet}
        onClose={toggleShowResetWalletModal(false)}
      />
      <ExportSeedPhraseModal
        show={isOpenSeedModal}
        onClose={toggleShowSeedModal(false)}
      />
    </>
  );
};
