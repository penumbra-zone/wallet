import {
  ChainParameters,
  CompactBlock,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { ExtensionStorage } from '../storage';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';

function toJson(data) {
  return JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? `${v}n` : v
  ).replace(/"(-?\d+)n"/g, (_, a) => a);
}

export class ViewProtocolService {
  indexedDb;
  extensionStorage;
  constructor({
    indexedDb,
    extensionStorage,
  }: {
    indexedDb: IndexedDb;
    extensionStorage: ExtensionStorage;
  }) {
    this.indexedDb = indexedDb;
    this.extensionStorage = extensionStorage;
  }

  async getAssets() {
    const assets: EncodeAsset[] = await this.indexedDb.getAllValue('assets');
    return assets;
  }

  async getChainParameters() {
    const chainParameters: ChainParameters[] = await this.indexedDb.getAllValue(
      'chainParameters'
    );

    return toJson(chainParameters);
  }

  async getNotes() {
    const notes: CompactBlock[] = await this.indexedDb.getAllValue('notes');
    return notes;
  }

  async getStatus() {
    const data = await this.extensionStorage.getState([
      'lastSavedBlock',
      'lastBlockHeight',
    ]);
    return {
      sync_height: data.lastSavedBlock.testnet,
      catching_up: data.lastSavedBlock.testnet === data.lastBlockHeight.testnet,
    };
  }
}
