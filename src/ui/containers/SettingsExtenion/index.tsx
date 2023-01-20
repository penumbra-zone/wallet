import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { Button, ChevronLeftIcon, CloseSvg } from '../../components';

export const SettingsExtenion = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleBack = () => navigate(routesPath.SETTINGS);

  const handleHome = () => navigate(routesPath.HOME);

  return (
    <div className="min-h-[500px] w-[100%]">
      <div className="h-[100%] bg-brown rounded-[15px] pb-[28px]">
        {pathname === routesPath.SETTINGS ? (
          <></>
        ) : (
          <Button
            mode="icon_transparent"
            onClick={handleBack}
            title="Back"
            iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
            className="text-[12px] pl-[8px] pt-[22px] pb-[2px]"
          />
        )}
        {pathname === routesPath.SETTINGS && (
          <div
            className={`pt-[24px] px-[16px] flex justify-between items-center pb-[16px] ${
              pathname !== routesPath.SETTINGS
                ? 'border-b-[1px] border-solid border-dark_grey'
                : ''
            }`}
          >
            <p className="h1_ext">Settings</p>
            <span className="cursor-pointer" onClick={handleHome}>
              <CloseSvg width="14" height="14" fill="white" />
            </span>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
};
