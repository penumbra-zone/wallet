import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import { ExtensionStorage } from '../storage';
import { RemoteConfigController } from './RemoteConfigController';

export enum NetworkName {
  Testnet = 'testnet',
  MAINNET = 'mainnet',
}

export class NetworkController extends EventEmitter {
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
    super();
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        currentNetwork: NetworkName.Testnet,
        customGRPC: {
          testnet: null,
          mainnet: null,
        },
        customTendermint: {
          testnet: null,
          mainnet: null,
        },
      })
    );

    extensionStorage.subscribe(this.store);

    this.configApi = { getNetworkConfig, getNetworks };
  }

  resetWallet() {
    this.store.updateState({
      customGRPC: {
        testnet: null,
        mainnet: null,
      },
      customTendermint: {
        testnet: null,
        mainnet: null,
      },
    });
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

  setCustomGRPC(url: string | null | undefined, network = NetworkName.Testnet) {
    const { customGRPC } = this.store.getState();
    customGRPC[network] = url;
    this.store.updateState({ customGRPC });
    this.emit('change grpc');
  }

  setCustomTendermint(url: string | undefined, network = NetworkName.Testnet) {
    const { customTendermint } = this.store.getState();
    customTendermint[network] = url;
    this.store.updateState({ customTendermint });
  }

  getCustomTendermint() {
    return this.store.getState().customTendermint;
  }

  getCustomGRPC() {
    return this.store.getState().customGRPC;
  }

  getNode(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomGRPC()[network] || networks[network].grpc;
  }

  getNetworkGRPC(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomGRPC()[network] || networks[network].grpc;
  }

  getNetworkTendermint(network?: NetworkName) {
    const networks = this.configApi.getNetworkConfig();
    network = network || this.getNetwork();
    return this.getCustomTendermint()[network] || networks[network].tendermint;
  }
}
