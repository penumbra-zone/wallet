import { Link, useLocation } from 'react-router-dom';
import { routesPath } from '../../../utils';
import {
  AdditionallySvg,
  BellSvg,
  ContactsSvg,
  InformationOutlineSvg,
  LockSvg,
  PlugSvg,
  SettingsSvg,
} from '../Svg';

const links = [
  {
    to: routesPath.SETTINGS,
    svg: <SettingsSvg />,
    text: 'Support',
  },
  {
    to: routesPath.SETTINGS_ADDITIONALLY,
    svg: <AdditionallySvg />,
    text: 'Additionally',
  },
  {
    to: routesPath.SETTINGS_CONTACTS,
    svg: <ContactsSvg />,
    text: 'Contact Information',
  },
  {
    to: routesPath.SETTINGS_SECURITY_PRIVACY,
    svg: <LockSvg />,
    text: 'Security and Privacy',
  },
  {
    to: routesPath.SETTINGS_WARNINGS,
    svg: <BellSvg />,
    text: 'Warnings',
  },
  {
    to: routesPath.SETTINGS_NETWORKS,
    svg: <PlugSvg />,
    text: 'Networks',
  },
  {
    to: routesPath.SETTINGS_GENERAL_INFORMATION,
    svg: <InformationOutlineSvg height="20" width="20" />,
    text: 'General information',
  },
];
export const SettingSideBar = () => {
    const {pathname} = useLocation()
  return (
    <div className="h-[100%] w-[206px] border-r-[1px] border-solid border-dark_grey pt-[16px]">
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {links.map((i) => {
          return (
            <li key={i.to}>
              <Link to={i.to}>
                <div className="flex items-center py-[13.5px] pl-[20px] hover:bg-dark_grey">
                  <span
                    className={`w-[20px] h-[20px] ${
                      pathname === i.to
                        ? ''
                        : i.to === routesPath.SETTINGS
                        ? 'svg_notActive_link_stroke'
                        : 'svg_notActive_link'
                    }`}
                  >
                    {i.svg}
                  </span>
                  <p
                    className={`pl-[18px] text_ext ${
                      pathname === i.to ? 'text-white' : 'text-light_brown'
                    }`}
                  >
                    {i.text}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
