import {
  ChainParameters,
  CompactBlock,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { ClientController } from '../controllers';
import { ExtensionStorage } from '../storage';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';

function toJson(data) {
  return JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? `${v}n` : v
  ).replace(/"(-?\d+)n"/g, (_, a) => a);
}

export class ViewProtocolService {
  private indexedDb;
  private extensionStorage;
  private getLastExistBlock;
  constructor({
    indexedDb,
    extensionStorage,
    getLastExistBlock,
  }: {
    indexedDb: IndexedDb;
    extensionStorage: ExtensionStorage;
    getLastExistBlock: ClientController['getLastExistBlock'];
  }) {
    this.indexedDb = indexedDb;
    this.extensionStorage = extensionStorage;
    this.getLastExistBlock = getLastExistBlock;
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
    const { lastSavedBlock } = await this.extensionStorage.getState(
      'lastSavedBlock'
    );
    const lasBlock = await this.getLastExistBlock();
    return {
      sync_height: lastSavedBlock.testnet,
      catching_up: lastSavedBlock.testnet === lasBlock,
      last_block: lasBlock,
    };
  }
}
