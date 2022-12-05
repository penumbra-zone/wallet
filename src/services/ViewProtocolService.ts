import { ChainParameters } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { ClientController, Transaction } from '../controllers';
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
    const notes = await this.indexedDb.getAllValue('notes');

    const mapData = notes.map((i) => ({
      note_commitment: i.note_commitment,
      note: {
        value: i.value,
        note_blinding: i.note_blinding,
        address: i.address,
      },
      address_index: 0,
      nullifier: i.nullifier,
      height_created: i.height,
      //TODO add height_spent and position
      height_spent: undefined,
      position: undefined,
      source: i.source,
    }));

    return mapData;
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

  async getTransactionHashes(startHeight?: number, endHeight?: number) {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    let data: Transaction[] = [];
    if (startHeight && endHeight) {
      data = tx.filter(
        (i) => i.block_height >= startHeight && i.block_height <= endHeight
      );
    } else if (startHeight && !endHeight) {
      data = tx.filter((i) => i.block_height >= startHeight);
    } else {
      data = tx;
    }

    return data.map((i) => ({
      block_height: i.block_height,
      tx_hash: i.tx_hash,
    }));
  }
}
