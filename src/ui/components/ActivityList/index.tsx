import { useParams } from 'react-router-dom';
import { getShortKey } from '../../../utils';
import { Button } from '../Button';
import { ArrowUpRightSvg, DowmloadSvg } from '../Svg';
import moment from 'moment';

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

export const ActivityList = () => {
  const { name } = useParams();
  return (
    <div className="w-[100%] flex flex-col items-center">
      <div className="w-[100%] flex flex-col ext:mb-[32px] tablet:mb-[8px]">
        {[].map((i, index) => {
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
                      <p className="text-green">
                        {moment(i.date).format('MMM D')}
                      </p>
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
                    {i.value} {name ? name.toUpperCase() : 'PNB'}
                  </p>
                  <p className="text_ext text-light_grey">
                    {i.value} {name ? name.toUpperCase() : 'PNB'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* <Button
        mode="gradient"
        title="More"
        className="ext:w-[96px] tablet:w-[192px]"
      /> */}
    </div>
  );
};
