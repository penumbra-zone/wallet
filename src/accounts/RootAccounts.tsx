import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAccountsSelector } from '.';
import { routesPath } from '../utils';
import {
  selectRedirectToAccountPage,
  selectSelectedAccount,
  selectState,
} from '../ui/redux';
import { RootWrapperAccount } from '../ui/containers';
import { Toaster } from 'react-hot-toast';
import Background from '../ui/services/Background';

export const RootAccounts = () => {
  const navigate = useNavigate();

  const state = useAccountsSelector(selectState);
  const selectedAccount = useAccountsSelector(selectSelectedAccount);
  const isRedirect = useAccountsSelector(selectRedirectToAccountPage);
  const s = useAccountsSelector((s) => s);

  const getBlocks = async () => await Background.getCompactBlockRange();

  useEffect(() => {
    if (!isRedirect) return;

    if (selectedAccount.name && isRedirect && !state.isLocked) {
      getBlocks();
      return navigate(routesPath.HOME);
    }

    if (!state.isInitialized) return navigate(routesPath.WELCOME);
    if (state.isInitialized && !state.isLocked)
      return navigate(routesPath.SEED_PHRASE_RULES);
    if (state.isInitialized && state.isLocked)
      return navigate(routesPath.LOGIN);
  }, [state.isInitialized, state.isLocked, selectedAccount, isRedirect]);

  return (
    <RootWrapperAccount>
      <Toaster />
      <Outlet />
    </RootWrapperAccount>
  );
};
