import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { RemoteConfigController } from './RemoteConfigController';

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
    getNetworkConfig: RemoteConfigController['getNetworkConfig'];
    getNetworks: RemoteConfigController['getNetworks'];
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
    return this.configApi
      .getNetworks()
      .map((name) => ({ ...networks[name], name }));
  }

  setNetwork(network: NetworkName) {
    this.store.updateState({ currentNetwork: network });
  }

  getNetwork() {
    return this.store.getState().currentNetwork;
  }

  setCustomNode(url: string | null | undefined, network = NetworkName.Testnet) {
    const { customNodes } = this.store.getState();
    customNodes[network] = url;
    this.store.updateState({ customNodes });
  }

  setCustomCode(code: string | undefined, network = NetworkName.Testnet) {
    const { customCodes } = this.store.getState();
    customCodes[network] = code;
    this.store.updateState({ customCodes });
  }

  getCustomCodes() {
    return this.store.getState().customCodes;
  }

  getNetworkCode(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomCodes()[network] || networks[network].code;
  }

  getCustomNodes() {
    return this.store.getState().customNodes;
  }

  getNode(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomNodes()[network] || networks[network].server;
  }
}
