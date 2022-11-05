import EventEmitter from 'events';
import ObservableStore from 'obs-store';
import { DEFAULT_LEGACY_CONFIG } from '../lib';
import { ExtensionStorage } from '../storage';
import { NetworkName } from './NetworkController';

const extendValues = (defaultValues: any, newValues: any) => {
  return Object.entries(defaultValues).reduce(
    (acc, [key, value]) => {
      try {
        switch (typeof value) {
          case 'number':
            acc[key] = Number(acc[key]) ? acc[key] : value;
            break;
          case 'string':
            acc[key] = typeof acc[key] === 'string' ? acc[key] : value;
            break;
          case 'object':
            acc[key] = Array.isArray(value)
              ? [...value, ...(acc[key] || [])]
              : { ...value, ...acc[key] };
            break;
        }
      } catch (e) {
        acc[key] = value;
      }
      return acc;
    },
    { ...newValues }
  );
};

export interface NetworkConfigItem {
  server: string;
  chainId?: string;
}

type NetworkConfig = Record<string, NetworkConfigItem>;

export class RemoteConfigController extends EventEmitter {
  store;
  constructor({ extensionStorage }: { extensionStorage: ExtensionStorage }) {
    super();

    this.store = new ObservableStore(
      extensionStorage.getInitState({
        config: {
          //TODO how to get 2 networks
          networks: DEFAULT_LEGACY_CONFIG.NETWORKS,
          network_config: DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG,
          messages_config: DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG,
          pack_config: DEFAULT_LEGACY_CONFIG.PACK_CONFIG,
          idle: DEFAULT_LEGACY_CONFIG.IDLE,
        },
      })
    );

    extensionStorage.subscribe(this.store);
  }

  setNetworks(chainId: string, type: NetworkName) {
    const oldStore = this.store.getState().config;

    const config = {
      ...oldStore,
      network_config: {
        ...oldStore.network_config,
        [type]: {
          ...oldStore.network_config[type],
          chainId,
        },
      },
    };

    this.store.updateState({ config });
  }

  getPackConfig(): typeof DEFAULT_LEGACY_CONFIG.PACK_CONFIG {
    try {
      const { pack_config } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.PACK_CONFIG, pack_config);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.PACK_CONFIG;
    }
  }
  getIdleConfig() {
    try {
      const { idle } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.IDLE, idle);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.IDLE;
    }
  }

  getMessagesConfig() {
    try {
      const { messages_config } = this.store.getState().config;
      return extendValues(
        DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG,
        messages_config
      );
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.MESSAGES_CONFIG;
    }
  }

  getBlacklist() {
    try {
      const { blacklist } = this.store.getState();

      if (Array.isArray(blacklist)) {
        return blacklist.filter((item) => typeof item === 'string');
      }

      return [];
    } catch (e) {
      return [];
    }
  }
  getWhitelist() {
    try {
      const { whitelist } = this.store.getState();

      if (Array.isArray(whitelist)) {
        return whitelist.filter((item) => typeof item === 'string');
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  getNetworkConfig(): NetworkConfig {
    try {
      const { network_config } = this.store.getState().config;
      return extendValues(DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG, network_config);
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.NETWORK_CONFIG;
    }
  }

  getNetworks() {
    try {
      const { networks } = this.store.getState().config;
      return networks || DEFAULT_LEGACY_CONFIG.NETWORKS;
    } catch (e) {
      return DEFAULT_LEGACY_CONFIG.NETWORKS;
    }
  }
}
