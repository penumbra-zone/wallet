import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';

import { ObliviousQuery } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { ExtensionStorage } from '../storage';
import {
  AssetListRequest,
  ChainParamsRequest,
  CompactBlockRangeRequest,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import ObservableStore from 'obs-store';
import { IndexedDb } from '../utils';
import { CompactBlock } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { decrypt_note } from 'penumbra-web-assembly';
import { WalletController } from './WalletController';

export class ClientController {
  transport;
  client;
  store;
  db;
  getAccountFullViewingKey;
  extensionStorage;
  indexedDb;

  constructor({
    extensionStorage,
    getAccountFullViewingKey,
  }: {
    extensionStorage: ExtensionStorage;
    getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword'];
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({ lastSavedBlock: 1 })
    );
    this.getAccountFullViewingKey = getAccountFullViewingKey;
    // this.db = new IndexedDb()

    extensionStorage.subscribe(this.store);

    this.transport = createGrpcWebTransport({
      baseUrl: 'http://testnet.penumbra.zone:8080',
    });
    this.client = createPromiseClient(ObliviousQuery, this.transport);

    this.indexedDb = new IndexedDb();
  }

  async getAssets() {
    const assetsRequest = new AssetListRequest();
    assetsRequest.chainId = 'penumbra-testnet-aoede';

    const res = await this.client.assetList(assetsRequest);
    const newRes = res.assets.map((asset) => ({
      id: asset.id?.inner,
      denom: asset.denom?.denom,
    }));

    await this.indexedDb.putBulkValue('assets', newRes);
  }

  async getChainParams() {
    const chainParameters = new ChainParamsRequest();
    chainParameters.chainId = 'penumbra-testnet-aoede';

    const res = await this.client.chainParameters(chainParameters);

    await this.indexedDb.putValue('chain', res);
  }

  async getCompactBlockRange() {
    let fvk;
    try {
      fvk = this.getAccountFullViewingKey();
    } catch (error) {
      fvk = '';
    }
    if (!fvk) {
      return;
    }

    const compactBlockRangeRequest = new CompactBlockRangeRequest();
    compactBlockRangeRequest.chainId = 'penumbra-testnet-aoede';
    compactBlockRangeRequest.startHeight = this.store.getState().lastSavedBlock;
    compactBlockRangeRequest.keepAlive = true;
    try {
      for await (const response of this.client.compactBlockRange(
        compactBlockRangeRequest
      )) {
        this.scanBlock(response, fvk);
        this.store.updateState({ lastSavedBlock: Number(response.height) });
      }
    } catch (error) {}
  }

  async scanBlock(compactBlock: CompactBlock, fvk: string) {
    // console.log('Handle block with height ' + compactBlock.height);
    if (this.requireScanning(compactBlock)) {
      for (const notePayload of compactBlock.notePayloads) {
        try {
          let decryptedNote = decrypt_note(
            fvk,
            this.toHexString(notePayload.payload?.encryptedNote),
            this.toHexString(notePayload.payload?.ephemeralKey)
          );
          console.log('decrypted note: ', decryptedNote);

          await this.indexedDb.putBulkValue('notes', decryptedNote);
        } catch (e) {}
      }
    }
    // else console.log('skip empty block with height ' + compactBlock.height);
  }

  requireScanning(compactBlock: CompactBlock) {
    return (
      compactBlock.notePayloads != null && compactBlock.notePayloads.length != 0
    );
  }

  toHexString(bytes: any) {
    return bytes.reduce(
      (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
      ''
    );
  }
}
