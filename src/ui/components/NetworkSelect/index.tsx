import React, { useCallback, useEffect } from 'react';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import {
  getLastBlockHeight,
  selectCurNetwork,
  selectLastExistBlock,
  selectLastSavedBlock,
  selectNetworks,
} from '../../redux';
import { ProgressBar } from '../ProgressBar';
import { DoneSvg } from '../Svg';

type NetworkSelectProps = {
  onClick: () => void;
  className?: string;
};

export function percentage(partialValue, totalValue) {
  if (!totalValue) return 0;
  return Math.round((100 * partialValue) / totalValue);
}

export const NetworkSelect: React.FC<NetworkSelectProps> = ({
  className,
  onClick,
}) => {
  const dispatch = useAppDispatch();
  const networks = useAccountsSelector(selectNetworks);
  const currentNetworkName = useAccountsSelector(selectCurNetwork);
  const lastExistBlock = useAccountsSelector(selectLastExistBlock);
  const lastSavedBlock = useAccountsSelector(selectLastSavedBlock);

  const percent = percentage(lastSavedBlock, lastExistBlock);

  const currrentNetwork = useCallback(() => {
    return networks.find((i) => i.name === currentNetworkName);
  }, [networks, currentNetworkName]);

  useEffect(() => {
    dispatch(getLastBlockHeight());
  }, []);

  console.log({ lastExistBlock, lastSavedBlock });
  return (
    <div
      onClick={onClick}
      className={`h-[52px] w-[296px] px-[21px] bg-brown rounded-[15px] border-[1px] border-solid border-dark_grey flex items-center justify-between cursor-pointer
      ${className}`}
    >
      {percent === 101 ? (
        <DoneSvg />
      ) : (
        <div className="w-[35px] h-[35px] mr-[16px]">
          <ProgressBar percent={percent} />
        </div>
      )}
      <p className="text_button">{currrentNetwork().code}</p>
    </div>
  );
};
