import { ViewProtocolService } from './ViewProtocolService';
import { TransactionPlan } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/transaction/v1alpha1/transaction_pb';
import { ChainParametersResponse } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';

export class TransactionPlanner {
  private viewService: ViewProtocolService;

  constructor({ viewService }: { viewService: ViewProtocolService }) {
    this.viewService = viewService;
  }

  async plan(): Promise<TransactionPlan> {
    let chainParametersBytes = await this.viewService.getChainParameters();

    const chainParameters = new ChainParametersResponse().fromBinary(
      chainParametersBytes
    );

    let transactionPlan = new TransactionPlan();
    transactionPlan.chainId = chainParameters.chainParameters.chainId;

    return;
  }
}
