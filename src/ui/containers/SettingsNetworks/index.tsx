import { useEffect, useMemo, useState } from 'react';
import { useAccountsSelector } from '../../../accounts';
import { useMediaQuery } from '../../../hooks';
import { routesPath } from '../../../utils';
import { Button, DoneSvg, Input } from '../../components';
import {
  NetworkType,
  selectCurNetwork,
  selectCustomGRPC,
  selectCustomTendermint,
  selectNetworks,
} from '../../redux';
import Background from '../../services/Background';

export const SettingsNetworks = () => {
  const isDesktop = useMediaQuery();

  const networks = useAccountsSelector(selectNetworks);
  const customTendermint = useAccountsSelector(selectCustomTendermint);
  const customGRPC = useAccountsSelector(selectCustomGRPC);
  const currentNetwork = useAccountsSelector(selectCurNetwork);

  const [inputsValues, setInputsValues] = useState<{
    chainId: string;
    grpc: string;
    tendermint: string;
  }>({
    chainId: '',
    grpc: '',
    tendermint: '',
  });
  const [selected, setSelected] = useState<NetworkType>(networks[0]);

  useEffect(() => {
    setInputsValues({
      chainId: selected.chainId,
      grpc: customGRPC[selected.name] || selected.grpc,
      tendermint: customTendermint[selected.name] || selected.tendermint,
    });
  }, [selected, networks, customTendermint, customGRPC]);

  const handleSelect = (value: NetworkType) => () => setSelected(value);

  const handleChange =
    (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputsValues((state) => ({
        ...state,
        [type]: event.target.value,
      }));
    };

  const handleCancel = () =>
    setInputsValues({
      chainId: selected.chainId,
      grpc: customGRPC[selected.name] || selected.grpc,
      tendermint: customTendermint[selected.name] || selected.tendermint,
    });

  const handleSave = async () => {
    if (selected.grpc !== inputsValues.grpc) {
      await Background.setCustomGRPC(inputsValues.grpc, selected.name);
    }
    if (selected.chainId !== inputsValues.chainId) {
    }
    if (selected.tendermint !== inputsValues.tendermint) {
      await Background.setCustomTendermint(
        inputsValues.tendermint,
        selected.name
      );
    }
  };

  const isDisabled = useMemo(() => {
    return (
      selected.grpc === inputsValues.grpc &&
      selected.chainId === inputsValues.chainId &&
      selected.tendermint === inputsValues.tendermint
    );
  }, [selected, inputsValues]);

  const handleOpentTab = () =>
    Background.showTab(
      window.location.origin + `/accounts.html#/settings/general-information`,
      'accounts'
    );

  return (
    <div className="w-[100%] ext:h-[calc(100%-100px)] tablet:h-[100%] flex">
      <div className="ext:w-[100%] tablet:w-[816px] h-[100%] flex rounded-[15px]">
        <div className="ext:w-[100%] tablet:w-[55%] h-[100%] flex flex-col justify-between ext:pt-[16px] tablet:pt-[24px] tablet:pr-[15px]">
          <div className="tablet:-mx-[16px]">
            {networks.map((i, index) => (
              <div
                key={index}
                className={`w-[100] flex items-center px-[16px] text_ext cursor-pointer hover:bg-dark_grey py-[12px] ${
                  selected.chainId === i.chainId ? 'bg-dark_grey' : ''
                }`}
                onClick={handleSelect(i)}
              >
                <span className="pr-[18px]">
                  {currentNetwork === i.name && (
                    <DoneSvg width="18" height="18" />
                  )}
                </span>
                <p>{i.chainId}</p>
              </div>
            ))}
          </div>
          {!isDesktop && (
            <Button
              title="Add network"
              mode="gradient"
              onClick={handleOpentTab}
              className="w-[calc(100%-32px)] py-[7px] mx-[16px]"
            />
          )}
        </div>
        {isDesktop && (
          <div className="w-[45%] h-[100%] flex flex-col pt-[24px] pl-[20px] pr-[4px] border-l-[1px] border-solid border-dark_grey ">
            <Input
              label="Network name"
              value={inputsValues.chainId}
              onChange={handleChange('name')}
            />
            <Input
              label="New GRPC URL"
              value={inputsValues.grpc}
              onChange={handleChange('grpc')}
              className="py-[24px]"
            />
            <Input
              label="New tendermint URL"
              value={inputsValues.tendermint}
              onChange={handleChange('tendermint')}
            />
            <div className="flex mt-[20px] mb-[20px]">
              <Button
                title="Cancel"
                mode="transparent"
                onClick={handleCancel}
                className="w-[100%] py-[7px] mr-[4px]"
                disabled={isDisabled}
              />
              <Button
                title="Save"
                mode="gradient"
                onClick={handleSave}
                className="w-[100%] py-[7px] ml-[4px]"
                disabled={isDisabled}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
