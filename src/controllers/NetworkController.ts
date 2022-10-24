import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';

export enum NetworkName {
  Testnet = 'testnet',
}

export class NetworkController {
  store;
  private configApi;

  constructor({
    extensionStorage,
    getNetworkConfig,
    getNetworks,
  }: {
    extensionStorage: ExtensionStorage;
    getNetworkConfig: any;
    getNetworks: any;
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        currentNetwork: NetworkName.Testnet,
        customNodes: {
          testnet: null,
        },

        customCodes: {
          testnet: null,
        },
      })
    );

    extensionStorage.subscribe(this.store);

    this.configApi = { getNetworkConfig, getNetworks };
  }

  getNetworks() {
    const networks = this.configApi.getNetworkConfig();
    return this.configApi.getNew;
  }
}
