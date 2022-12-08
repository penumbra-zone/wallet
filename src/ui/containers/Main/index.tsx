import { useAccountsSelector } from '../../../accounts';
import { getShortKey } from '../../../utils';
import {
  ActivityList,
  AssetsList,
  BalanceAction,
  CopySvg,
  MorePopupButton,
  Tabs,
} from '../../components';
import { selectSelectedAccount, selectState } from '../../redux';
import toast from 'react-hot-toast';

type MainProps = {};

export const Main: React.FC<MainProps> = () => {
  const selectedAccount = useAccountsSelector(selectSelectedAccount);
  const state = useAccountsSelector(selectState);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedAccount.addressByIndex);
    toast.success('Success copied!', {
      position: 'top-right',
    });
  };

  if (state.isLocked) return <></>;

  if (!selectedAccount.addressByIndex) return <></>;

  return (
    <div className="ext:w-[400px] tablet:w-[100%] mt-[10px] mb-[20px] ">
      <div className="tablet:w-[816px] ext:mx-[40px] tablet:mx-[0px] flex flex-col justify-center bg-brown rounded-[15px] relative pb-[40px]">
        <MorePopupButton />
        <div className="flex flex-col items-center justify-center ext:pt-[20px] tablet:pt-[24px] ext:pb-[16px] tablet:pb-[14px]">
          <p className="h1 mb-[4px]">{selectedAccount.name}</p>
          <div className="flex items-center  text_body text-light_grey">
            {getShortKey(selectedAccount.addressByIndex)}
            <span
              className="ml-[7px] cursor-pointer svg_hover"
              onClick={copyToClipboard}
              role="button"
              tabIndex={0}
            >
              <CopySvg fill="#E0E0E0" />
            </span>
          </div>
        </div>
        <div className="pt-[16px] flex flex-col items-center justify-center">
          <div className="w-[100%] ext:mb-[24px] tablet:mb-[40px]">
            <BalanceAction />
          </div>
          <Tabs
            tabs={['Assets', 'Activity']}
            children={(type) =>
              type === 'Assets' ? <AssetsList /> : <ActivityList />
            }
          />
        </div>

        <p className="mt-[60px] text-center text_body text-light_grey">
          Need help? Contact Penumbra Support
        </p>
      </div>
    </div>
  );
};
