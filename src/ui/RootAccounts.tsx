import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAccountsSelector } from '../accounts';
import { selectState } from './redux';

export const RootAccounts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = useAccountsSelector(selectState);

  console.log({ state });

  const currentNetwork = useAccountsSelector(
    (state: any) => state.currentNetwork
  );
  const prevNetworkRef = useRef(currentNetwork);

  useEffect(() => {
    if (currentNetwork === prevNetworkRef.current) {
      return;
    }
    navigate('/', { replace: true });
    prevNetworkRef.current = currentNetwork;
  }, [currentNetwork, navigate]);

  if (!state?.initialized && location.pathname !== '/init-vault') {
    return <div>Welcome</div>;
  }

  if (
    state?.initialized &&
    state?.locked &&
    location.pathname !== '/forgot-password'
  ) {
    return <div>Login</div>;
  }
  if (
    state?.initialized &&
    !state?.locked &&
    location.pathname === '/forgot-password'
  ) {
    return <Navigate to="/" />;
  }

  return <div>Outlet</div>;
};
