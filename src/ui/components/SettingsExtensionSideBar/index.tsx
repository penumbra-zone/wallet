import { Link } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { links } from '../SettingSideBar';
import { ChevronLeftIcon } from '../Svg';

export const SettingsExtensionSideBar = () => {
  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {links.map((i) => {
        return (
          <li key={i.to}>
            <Link to={i.to}>
              <div className="flex justify-between items-center hover:bg-dark_grey mb-[12px] px-[16px] py-[11px]">
                <div className="flex items-center">
                  <span
                    className={`w-[20px] h-[20px] ${
                      i.to === routesPath.SETTINGS
                        ? 'svg_notActive_link_stroke'
                        : 'svg_notActive_link'
                    }`}
                  >
                    {i.svg}
                  </span>
                  <p className={`pl-[18px] text_ext ${'text-light_brown'}`}>
                    {i.text}
                  </p>
                </div>
                <div className="rotate-180">
                  <ChevronLeftIcon width="20" height="20" stroke="#524B4B" />
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
