import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';

import { ObliviousQuery } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { ExtensionStorage } from '../storage';
import { CompactBlockRangeRequest } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import ObservableStore from 'obs-store';

export class ClientController {
  transport;
  client;
  store;

  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ startHeight: 1 })
    );

    extensionStorage.subscribe(this.store);

    this.transport = createGrpcWebTransport({
      baseUrl: 'http://testnet.penumbra.zone:8080',
    });
    this.client = createPromiseClient(ObliviousQuery, this.transport);
  }

  async getCompactBlockRange() {
    const compactBlockRangeRequest = new CompactBlockRangeRequest();
    compactBlockRangeRequest.chainId = 'penumbra-testnet-aoede';
    compactBlockRangeRequest.startHeight = this.store.getState().startHeight;
    compactBlockRangeRequest.keepAlive = true;
    try {
      for await (const response of this.client.compactBlockRange(
        compactBlockRangeRequest
      )) {
        this.store.updateState({ startHeight: Number(response.height) });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
