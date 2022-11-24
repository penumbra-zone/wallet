import { useNavigate, useParams } from 'react-router-dom';
import { useAccountsSelector } from '../../../accounts';
import { getShortKey, routesPath } from '../../../utils';
import {
  ArrowUpRightSvg,
  BalanceAction,
  Button,
  ChevronLeftIcon,
  DotsSvg,
  DowmloadSvg,
} from '../../components';
import { selectNewAccount } from '../../redux';

const activity = [
  {
    type: 'receive',
    date: new Date(),
    value: 12,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
  {
    type: 'send',
    date: new Date(),
    value: -1,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
  {
    type: 'receive',
    date: new Date(),
    value: 121,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
  {
    type: 'send',
    date: new Date(),
    value: -1223,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
  {
    type: 'receive',
    date: new Date(),
    value: 1,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
  {
    type: 'send',
    date: new Date(),
    value: -1123,
    address:
      'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9',
  },
];

const icon = {
  receive: <DowmloadSvg />,
  send: <ArrowUpRightSvg />,
};

const textAction = {
  receive: 'From:',
  send: 'Addressee:',
};

export const BalanceDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const handleBack = () => navigate(routesPath.HOME);
  const account = useAccountsSelector(selectNewAccount);

  return (
    <div className="ext:w-[400px] tablet:w-[100%] mt-[10px] mb-[20px] ">
      <div className="tablet:w-[816px] ext:mx-[40px] tablet:mx-[0px] flex flex-col items-center bg-brown rounded-[15px] relative ext:pb-[28px] tablet:pb-[40px]">
        <div
          className="absolute ext:right-[24px] ext:top-[28px] tablet:right-[30px] tablet:top-[34px] cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <DotsSvg />
        </div>
        <Button
          mode="icon_transparent"
          onClick={handleBack}
          title={`${account.name} / ${name.toUpperCase()} `}
          iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
          className="self-start ext:mt-[20px] ext:ml-[8px] tablet:mt-[24px] tablet:ml-[16px]"
        />
        <div className="w-[100%] ext:mt-[25px] tablet:mt-[27px] mb-[40px]">
          <BalanceAction />
        </div>
        <div className="w-[100%] flex flex-col ext:mb-[32px] tablet:mb-[8px]">
          {activity.map((i, index) => {
            return (
              <div
                key={index}
                className="px-[18px] py-[12px] border-y-[1px] border-solid border-dark_grey ext:mb-[8px] tablet:mb-[16px]"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {icon[i.type]}
                    <div className="flex flex-col ml-[16px]">
                      <p className="h3 mb-[6px]">{i.type}</p>
                      <div className="flex text_ext">
                        <p className="text-green">{`${i.date.getDate()}.${
                          i.date.getMonth() + 1
                        }`}</p>
                        <p className="text-light_grey ext:mx-[2px] tablet:mx-[6px]">
                          {textAction[i.type]}
                        </p>
                        <p className="text-light_grey">
                          {getShortKey(i.address)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text_numbers">
                      {i.value} {name.toUpperCase()}
                    </p>
                    <p className="text_ext text-light_grey">
                      {i.value} {name.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          mode="gradient"
          onClick={() => console.log('asd')}
          title="More"
          className="ext:w-[96px] tablet:w-[192px]"
        />
      </div>
    </div>
  );
};
