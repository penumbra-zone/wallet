import { useNavigate } from 'react-router-dom';
import { routesPath } from '../../../utils';
import { Balance } from '../Balance';
import { ChevronLeftIcon } from '../Svg';

export const AssetsList = () => {
  const navigate = useNavigate();
  const handleBalancedetail = (currencyName: string) => () =>
    navigate(routesPath.BALANCE_DETAIL.replace(':name', currencyName));
  return (
    <div
      onClick={handleBalancedetail('pnb')}
      className="flex items-center justify-between py-[20px] pl-[22px] pr-[30px] border-y-[1px] border-solid border-dark_grey cursor-pointer hover:bg-brown"
    >
      <div className="flex items-center">
        <div className="w-[51px] h-[51px] li_gradient rounded-[50%] flex  items-center justify-center">
          <div className="w-[50px] h-[50px] bg-brown rounded-[50%] flex items-center justify-center">
            PNB
          </div>
        </div>
        <Balance className="pl-[16px] text_numbers" />
      </div>
      <div className="rotate-180">
        <ChevronLeftIcon />
      </div>
    </div>
  );
};
