import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { routesPath } from '../utils';
import { selectSelectedAccount, selectState } from './redux';
import { RootWrapperUi } from './containers';
import { Toaster } from 'react-hot-toast';
import { useAccountsSelector } from '../accounts';

export const RootUi = () => {
  const navigate = useNavigate();
  const state = useAccountsSelector(selectState);
  const selectedAccount = useAccountsSelector(selectSelectedAccount);

  const haveActiveMessage = useAccountsSelector((state) =>
    Boolean(state.messageNotification.unapprovedMessages.length)
  );

  useEffect(() => {
    if (haveActiveMessage && !state.isLocked) {
      return navigate(routesPath.ACTIVE_MESSAGE);
    }

    if (selectedAccount.name && !state.isLocked) {
      return navigate(routesPath.HOME);
    }

    if (state.isInitialized && state.isLocked)
      return navigate(routesPath.LOGIN);
  }, [state.isInitialized, state.isLocked, selectedAccount, haveActiveMessage]);

  if (!state.isInitialized) return <></>;

  return (
    <RootWrapperUi>
      <Toaster />
      <Outlet />
    </RootWrapperUi>
  );
};
