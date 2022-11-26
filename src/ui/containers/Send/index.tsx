import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '../../../hooks';
import { routesPath } from '../../../utils';
import { CloseSvg, Input, SearchSvg } from '../../components';

export const Send = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery();
  const [search, setSearch] = useState<string>('');

  const handleBack = () => navigate(routesPath.HOME);

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(event.target.value);

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[400px] ext:py-[40px] tablet:py-[0px] ext:px-[40px] tablet:px-[0px] tablet:mb-[20px]">
        <div className="flex justify-center items-center ext:mb-[24px] tablet:mb-[16px]">
          <p className="h1 ml-[auto]">Send to address</p>
          <span
            className="ml-[auto] svg_hover cursor-pointer"
            onClick={handleBack}
            role="button"
            tabIndex={0}
          >
            <CloseSvg
              width={isDesktop ? '24' : '16'}
              height={isDesktop ? '24' : '16'}
              fill="#E0E0E0"
            />
          </span>
        </div>
        <Input
          placeholder="Search, address..."
          value={search}
          onChange={handleChangeSearch}
          leftSvg={
            <span className="ml-[24px] mr-[9px]">
              <SearchSvg />
            </span>
          }
          className="w-[100%] ext:mb-[16px] tablet:mb-[12px]"
        />
        <div className="bg-brown rounded-[15px] h-[492px]"></div>
      </div>
    </div>
  );
};
