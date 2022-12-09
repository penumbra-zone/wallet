import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { routesPath } from '../utils';
import { selectMessages, selectSelectedAccount, selectState } from './redux';
import { RootWrapperUi } from './containers';
import { Toaster } from 'react-hot-toast';
import { useAccountsSelector } from '../accounts';

export const RootUi = () => {
  const navigate = useNavigate();
  const state = useAccountsSelector(selectState);
  const selectedAccount = useAccountsSelector(selectSelectedAccount);
  const messages = useAccountsSelector(selectMessages);

  console.log(messages);
  
  useEffect(() => {
    if (selectedAccount.name && !state.isLocked) {
      return navigate(routesPath.HOME);
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
