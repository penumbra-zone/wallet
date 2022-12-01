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

  useEffect(() => {
    if (selectedAccount.name && !state.isLocked) {
      return navigate(routesPath.SETTINGS_NETWORKS);
    }

    if (state.isInitialized && state.isLocked)
      return navigate(routesPath.LOGIN);
  }, [state.isInitialized, state.isLocked, selectedAccount]);

  if (!state.isInitialized) return <></>;

  return (
    <RootWrapperUi>
      <Toaster />
      <Outlet />
    </RootWrapperUi>
  );
};
