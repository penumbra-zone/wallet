import { Outlet, useLocation } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { SettingSideBar } from '../../components';

export const header = {
  [routesPath.SETTINGS]: 'Support',
  [routesPath.SETTINGS_ADDITIONALLY]: 'Additionally',
  [routesPath.SETTINGS_CONTACTS]: 'Contact Information',
  [routesPath.SETTINGS_SECURITY_PRIVACY]: 'Security and Privacy',
  [routesPath.SETTINGS_WARNINGS]: 'Warnings',
  [routesPath.SETTINGS_NETWORKS]: 'Networks',
  [routesPath.SETTINGS_GENERAL_INFORMATION]: 'General information',
};

export const Settings = () => {
  const { pathname } = useLocation();

  return (
    <div className="w-[100%] h-[auto] flex justify-center mt-[18px]">
      <div className="w-[816px] flex flex-col bg-brown rounded-[15px]">
        <div className="flex pt-[16px] pb-[24px] border-b-[1px] border-solid border-dark_grey">
          <p className="h1 pl-[20px]">Settings</p>
        </div>
        <div className="flex h-[100%]">
          <SettingSideBar />
          <div className="w-[610px] flex flex-col">
            <p className="w-[100%] h2 pl-[16px] py-[21px] border-b-[1px] border-solid border-dark_grey">
              {header[pathname]}
            </p>
            <div className="px-[16px] h-[100%]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
