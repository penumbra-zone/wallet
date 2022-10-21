import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAccountsSelector } from '../accounts';

export const RootAccounts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialized = useAccountsSelector(
    (state: any) => state.state?.initialized
  );
  const locked = useAccountsSelector((state: any) => state.state?.locked);

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

  if (!initialized && location.pathname !== '/init-vault') {
    return <div>Welcome</div>;
  }

  if (initialized && locked && location.pathname !== '/forgot-password') {
    return <div>Login</div>;
  }
  if (initialized && !locked && location.pathname === '/forgot-password') {
    return <Navigate to="/" />;
  }

  return <div>Outlet</div>;
};
