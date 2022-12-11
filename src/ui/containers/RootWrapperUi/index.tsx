import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccountsSelector } from '../../../accounts';
import { routesPath } from '../../../utils';
import {
  AccountModal,
  Logo,
  NetworkModal,
  NetworkSelect,
  UserLogo,
} from '../../components';
import {
  selectRedirectToAccountPage,
  selectSelectedAccount,
  selectState,
} from '../../redux';

type RootWrapperUiProps = {
  children: React.ReactNode;
};

export const RootWrapperUi: React.FC<RootWrapperUiProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [isOpenAccountPopup, setIsOpenAccountPopup] = useState<boolean>(false);
  const [isOpenNetworkPopup, setIsOpenNetworkPopup] = useState<boolean>(false);

  const selectedAccount = useAccountsSelector(selectSelectedAccount);
  const isRedirect = useAccountsSelector(selectRedirectToAccountPage);
  const state = useAccountsSelector(selectState);

  const isHeader = pathname !== routesPath.ACTIVE_MESSAGE;

  const handleToggleAccountModal = (value: boolean) => () =>
    setIsOpenAccountPopup(value);

  const handleToggleNetworkModal = (value: boolean) => () =>
    setIsOpenNetworkPopup(value);

  return (
    <>
      <div className="w-[100%] min-h-[100vh] flex flex-col items-center overflow-y-hidden overflow-x-hidden">
        <div className="w-[400px] flex flex-col">
          {isHeader && (
            <div className="flex items-center justify-between px-[40px]  mt-[20px]">
              <Logo size="small" />
              {selectedAccount.addressByIndex &&
                isRedirect &&
                !state.isLocked && (
                  <NetworkSelect onClick={handleToggleNetworkModal(true)} />
                )}
              {selectedAccount.addressByIndex &&
                isRedirect &&
                !state.isLocked && (
                  <UserLogo onClick={handleToggleAccountModal(true)} />
                )}
            </div>
          )}
          <div className={`w-[100%] flex min-h-[calc(100vh-90px)]`}>
            {children}
          </div>
        </div>
      </div>
      <AccountModal
        show={isOpenAccountPopup}
        onClose={handleToggleAccountModal(false)}
      />
      <NetworkModal
        show={isOpenNetworkPopup}
        onClose={handleToggleNetworkModal(false)}
      />
    </>
  );
};
