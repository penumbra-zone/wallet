import { Button, Tabs } from '../../components';
import { AllValidators } from '../AllValidators';
import { useEffect, useState } from 'react';
import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';
import { ObliviousQueryService } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { ValidatorInfoRequest } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import { useAccountsSelector } from '../../../accounts';
import { selectNetworks } from '../../redux';
import { ValidatorInfo } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/stake/v1alpha1/stake_pb';

export const Validators = () => {
  const networks = useAccountsSelector(selectNetworks);
  const [validators, setValidators] = useState<ValidatorInfo[]>([]);

  const getValidators = async () => {
    const transport = createGrpcWebTransport({
      baseUrl: networks[0].grpc,
    });
    const client = createPromiseClient(ObliviousQueryService, transport);

    const validatorInfoRequest = new ValidatorInfoRequest();
    validatorInfoRequest.chainId = networks[0].chainId;

    try {
      for await (const response of client.validatorInfo(validatorInfoRequest)) {
        setValidators((state) => [...state, response.validatorInfo]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getValidators();
  }, []);

  return (
    <div className="w-[100%] mt-[20px] mb-[20px]">
      <div className="w-[816px]mx-[0px] flex flex-col items-center">
        {/* <div className="w-[100%] flex items-center justify-between rounded-[15px] bg-brown py-[24px] px-[20px] mb-[24px]">
          <div className="flex flex-col">
            <p className="h3 mb-[16px]">Total PNB Amount </p>
            <p className="text_numbers pb-[4px]">1,050.0096 PNB</p>
            <div className="flex text_number_s">
              <p>~ $306</p>
              <p className="text-green mx-[4px]">(-3.15%)</p>
              <p>24h</p>
            </div>
          </div>
          <div className="flex">
            <Button
              mode="transparent"
              onClick={() => console.log('asd')}
              title="Send"
              className="w-[110px] tablet:py-[9px]"
            />
            <Button
              mode="gradient"
              onClick={() => console.log('asd')}
              title="Deposit"
              className="w-[110px] ml-[16px] tablet:py-[9px]"
            />
          </div>
        </div>
        <div className="w-[100%] flex items-center justify-between rounded-[15px] bg-brown py-[24px] px-[20px] mb-[40px]">
          <div className="flex flex-col">
            <p className="h3 mb-[8px]">Staked Amount</p>
            <p className="text_numbers mb-[4px]">538 PNB</p>
            <p className="text_numbers_s">~$157</p>
          </div>
          <div className="flex flex-col border-l-[1px] border-solid border-light_brown pl-[24px]">
            <p className="h3 mb-[8px]">Available Balance</p>
            <p className="text_numbers mb-[4px]">507.3785 PNB</p>
            <p className="text_numbers_s">~$148</p>
          </div>
          <div className="flex flex-col border-l-[1px] border-solid border-light_brown pl-[24px]">
            <p className="h3 mb-[8px]">Claimable Rewards</p>
            <p className="text_numbers mb-[14px] ">~ $1.35</p>
          </div>
          <Button
            mode="gradient"
            onClick={() => console.log('asd')}
            title="Claim"
            className="w-[110px] ml-[16px] tablet:py-[9px]"
          />
        </div> */}
      </div>
      <Tabs
        tabs={['All Penumbra Validators', 'My Validators']}
        className="bg-[#000000]"
        children={(type) =>
          type === 'All Penumbra Validators' ? (
            <AllValidators validators={validators} />
          ) : (
            <div>My Validators</div>
          )
        }
      ></Tabs>
    </div>
  );
};
