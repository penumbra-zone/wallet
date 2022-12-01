import { useState } from 'react';
import { useMediaQuery } from '../../../hooks';
import {
  Button,
  ExportSeedPhraseModal,
  ResetWalletModal,
} from '../../components';

export const SettingsSecurityPrivacy = () => {
  const isDesktop = useMediaQuery();
  const [isOpenResetWallet, setIsOpenResetWallet] = useState<boolean>(false);
  const [isOpenSeedModal, setIsOpenSeedModal] = useState<boolean>(false);

  const toggleShowResetWalletModal = (value: boolean) => () =>
    setIsOpenResetWallet(value);

  const toggleShowSeedModal = (value: boolean) => () =>
    setIsOpenSeedModal(value);
  return (
    <>
      <div>
        <p className={`w-[100%] pl-[16px] py-[20px] border-b-[1px] border-solid border-dark_grey ${isDesktop ? 'h2': 'h1_ext'}`}>
          Security and Privacy
        </p>
        <div className="px-[16px] h-[100%]">
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
