import { useAccountsSelector } from '../../../accounts';
import { getShortKey } from '../../../utils';
import {
  AccountDetailModal,
  ArrowUpRightSvg,
  Button,
  CachedSvg,
  ChevronLeftIcon,
  CopySvg,
  DotsSvg,
  DowmloadSvg,
  ExportKeyModal,
  MoreModal,
  Tabs,
} from '../../components';
import { selectSelectedAccount, selectState } from '../../redux';
import toast from 'react-hot-toast';
import { useState } from 'react';

type MainProps = {};

export type KeysModalType = '' | 'full_viewing_key' | 'spending_key';

export const Main: React.FC<MainProps> = () => {
  const [isOpenMorePopup, setIsOpenMorePopup] = useState<boolean>(false);
  const [isOpenDetailPopup, setIsOpenDetailPopup] = useState<boolean>(false);
  const [keyModalType, setKeyModalType] = useState<KeysModalType>('');

  const selectedAccount = useAccountsSelector(selectSelectedAccount);
  const state = useAccountsSelector(selectState);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedAccount.addressByIndex);
    toast.success('Success copied!', {
      position: 'top-right',
    });
  };

  if (state.isLocked) return <></>;

  const toggleMorePopup = (value: boolean) => () => setIsOpenMorePopup(value);

  const toggleDetailPopup = (value: boolean) => () =>
    setIsOpenDetailPopup(value);

  const handleAccountDetail = () => {
    setIsOpenMorePopup(false);
    setIsOpenDetailPopup(true);
  };

  const changeKeyModalType = (type: KeysModalType) => () => {
    setKeyModalType(type);
    setIsOpenDetailPopup(false);
  };

  const handleBackExportPopup = () => {
    setIsOpenDetailPopup(true);
    setKeyModalType('');
  };
  if (!selectedAccount.addressByIndex) return <></>;
  return (
    <>
      <div className="w-[100%] mt-[10px] mb-[20px]">
        <div className="w-[816px] flex flex-col justify-center bg-brown rounded-[15px] relative pb-[40px]">
          <div
            className="absolute right-[30px] top-[34px] cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={toggleMorePopup(true)}
          >
            <DotsSvg />
          </div>
          <div className="flex flex-col items-center justify-center pt-[30px] pb-[24px]">
            <p className="h2 mb-[4px]">{selectedAccount.name}</p>
            <div className="flex items-center  text_body text-light_grey">
              {getShortKey(selectedAccount.addressByIndex)}
              <span
                className="ml-[7px] cursor-pointer"
                onClick={copyToClipboard}
                role="button"
                tabIndex={0}
              >
                <CopySvg fill="#E0E0E0" />
              </span>
            </div>
          </div>
          <div className="border-y-[1px] border-solid border-dark_grey pt-[16px] flex flex-col items-center justify-center">
            <div className="w-[51px] h-[51px] li_gradient rounded-[50%] flex  items-center justify-center">
              <div className="w-[50px] h-[50px] bg-brown rounded-[50%] flex items-center justify-center">
                PNB
              </div>
            </div>
            <p className="pt-[16px] pb-[24px] text_numbers">0 PNB</p>
            <div className="flex gap-x-[69px] mb-[60px]">
              <div className="flex flex-col items-center">
                <Button
                  mode="gradient"
                  onClick={() => console.log('asd')}
                  title={
                    <div className="flex items-center justify-center">
                      <DowmloadSvg />
                    </div>
                  }
                  className="rounded-[50%] w-[51px]"
                />
                <p className="text_button pt-[8px]">Receive</p>
              </div>
              <div className="flex flex-col items-center">
                <Button
                  mode="gradient"
                  onClick={() => console.log('asd')}
                  title={
                    <div className="flex items-center justify-center">
                      <ArrowUpRightSvg />
                    </div>
                  }
                  className="rounded-[50%] w-[51px]"
                />
                <p className="text_button pt-[8px]">Send</p>
              </div>
              <div className="flex flex-col items-center">
                <Button
                  mode="gradient"
                  onClick={() => console.log('asd')}
                  title={
                    <div className="flex items-center justify-center">
                      <CachedSvg />
                    </div>
                  }
                  className="rounded-[50%] w-[51px]"
                />
                <p className="text_button pt-[8px]">Exchange</p>
              </div>
            </div>
            <Tabs tabs={['Assets', 'Activity']} />
          </div>
          <div className="flex items-center justify-between py-[20px] pl-[22px] pr-[30px] border-b-[1px] border-solid border-dark_grey cursor-pointer">
            <div className="flex items-center">
              <div className="w-[51px] h-[51px] li_gradient rounded-[50%] flex  items-center justify-center">
                <div className="w-[50px] h-[50px] bg-brown rounded-[50%] flex items-center justify-center">
                  PNB
                </div>
              </div>
              <p className="pl-[16px] text_numbers">0 PNB</p>
            </div>
            <div className="rotate-180">
              <ChevronLeftIcon />
            </div>
          </div>
          <p className="mt-[60px] text-center text_body text-light_grey">
            Need help? Contact Penumbra Support
          </p>
        </div>
      </div>
      <MoreModal
        show={isOpenMorePopup}
        onClose={toggleMorePopup(false)}
        handleAccountDetail={handleAccountDetail}
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
    </>
  );
};
