import {
  ChainParameters,
  CompactBlock,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';

function toJson(data) {
  return JSON.stringify(data, (_, v) =>
    typeof v === 'bigint' ? `${v}n` : v
  ).replace(/"(-?\d+)n"/g, (_, a) => a);
}

export class ViewProtocolService {
  indexedDb;
  constructor({ indexedDb }: { indexedDb: IndexedDb }) {
    this.indexedDb = indexedDb;
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
}
