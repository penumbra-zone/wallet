import { useState } from 'react';
import { Button, ResetWalletModal } from '../../components';

export const SettingsSecurityPrivacy = () => {
  const [isOpenResetWallet, setIsOpenResetWallet] = useState<boolean>(false);

  const toggleShowResetWalletModal = (value: boolean) => () =>
    setIsOpenResetWallet(value);
  return (
    <>
      <div className="w-[100%] flex flex-col py-[24px]">
        <div className="flex flex-col pb-[40px]">
          <p className="h3">Show recovery passphrase</p>
          <Button
            title="Show passphrase"
            mode="gradient"
            onClick={() => console.log('asd')}
            className="w-[280px] mt-[16px]"
          />
        </div>
        <div className="flex flex-col">
          <p className="h3">Reset wallet</p>
          <Button
            title="Reset wallet"
            mode="gradient"
            onClick={toggleShowResetWalletModal(true)}
            className="w-[280px] mt-[16px]"
          />
        </div>
      </div>
      <ResetWalletModal
        show={isOpenResetWallet}
        onClose={toggleShowResetWalletModal(false)}
      />
    </>
  );
};
