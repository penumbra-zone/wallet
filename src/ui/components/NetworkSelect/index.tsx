import React, { useCallback, useEffect, useState } from 'react';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import {
  getLastBlockHeight,
  selectCurNetwork,
  selectLastExistBlock,
  selectLastSavedBlock,
  selectNetworks,
} from '../../redux';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';

type NetworkSelectProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};

class ChangingProgressProvider extends React.Component<any, any> {
  static defaultProps = {
    interval: 1000,
  };

  state = {
    valuesIndex: 0,
  };

  componentDidMount() {
    setInterval(() => {
      this.setState({
        valuesIndex: (this.state.valuesIndex + 1) % this.props.values.length,
      });
    }, this.props.interval);
  }

  render() {
    return this.props.children(this.props.values[this.state.valuesIndex]);
  }
}

function percentage(partialValue, totalValue) {
  if (!totalValue) return 0;
  return Math.round((100 * partialValue) / totalValue);
}

export const NetworkSelect: React.FC<NetworkSelectProps> = ({
  isOpen,
  className,
  onClick,
}) => {
  const dispatch = useAppDispatch();
  const networks = useAccountsSelector(selectNetworks);
  const currentNetworkName = useAccountsSelector(selectCurNetwork);
  const lastExistBlock = useAccountsSelector(selectLastExistBlock);
  const lastSavedBlock = useAccountsSelector(selectLastSavedBlock);

  const percent = percentage(lastSavedBlock, lastExistBlock);
  console.log({ lastExistBlock, lastSavedBlock });

  const currrentNetwork = useCallback(() => {
    return networks.find((i) => i.name === currentNetworkName);
  }, [networks, currentNetworkName]);

  useEffect(() => {
    dispatch(getLastBlockHeight());
  }, []);

  return (
    <div
      onClick={onClick}
      className={`h-[52px] w-[296px] px-[21px] bg-brown rounded-[15px] border-[1px] border-solid border-dark_grey flex items-center justify-between cursor-pointer
      ${className}`}
    >
      <div className="w-[35px] h-[35px] mr-[16px]">
        <CircularProgressbar
          value={percent}
          text={`${percent}%`}
          styles={{
            root: {},
            path: {
              stroke: `#00FFDF`,
              strokeLinecap: 'butt',
              transition: 'stroke-dashoffset 0.5s ease 0s',
              transform: 'rotate(0.25turn)',
              transformOrigin: 'center center',
            },
            trail: {
              stroke: '#282626',
              strokeLinecap: 'butt',
              transform: 'rotate(0.25turn)',
              transformOrigin: 'center center',
            },
            text: {
              fill: '#E0E0E0',
              fontSize: '24px',
              textAnchor: 'middle',
              dominantBaseline: 'middle',
              fontFamily: 'Faktum Bold',
            },
          }}
        />
       
      </div>
      <p className="text_button">{currrentNetwork().code}</p>
    </div>
  );
};
