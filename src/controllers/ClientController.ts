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
import { extension, TESTNET_URL } from '../lib';
import { RemoteConfigController } from './RemoteConfigController';
import { NetworkController } from './NetworkController';

export class ClientController {
  store;
  db;
  extensionStorage;
  indexedDb;
  private configApi;
  isReset;

  constructor({
    extensionStorage,
    getAccountFullViewingKey,
    setNetworks,
    getNetwork,
    getNetworkConfig,
  }: {
    extensionStorage: ExtensionStorage;
    getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword'];
    setNetworks: RemoteConfigController['setNetworks'];
    getNetwork: NetworkController['getNetwork'];
    getNetworkConfig: RemoteConfigController['getNetworkConfig'];
  }) {
    this.store = new ObservableStore(
      extensionStorage.getInitState({
        lastSavedBlock: {
          mainnet: 0,
          testnet: 0,
        },
      })
    );
    this.configApi = {
      getAccountFullViewingKey,
      setNetworks,
      getNetwork,
      getNetworkConfig,
    };
    extensionStorage.subscribe(this.store);
    this.isReset = false;

    this.indexedDb = new IndexedDb();
  }

  async getAssets() {
    const assets = await this.indexedDb.getAllValue('assets');

    if (assets.length) return;

    const { server, chainId } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const transport = createGrpcWebTransport({
      baseUrl: server,
    });
    const client = createPromiseClient(ObliviousQuery, transport);

    const assetsRequest = new AssetListRequest();
    assetsRequest.chainId = chainId;

    const res = await client.assetList(assetsRequest);
    const newRes = res.assets.map((asset) => ({
      id: asset.id?.inner,
      denom: asset.denom?.denom,
    }));

    await this.indexedDb.putBulkValue('assets', newRes);
  }

  async getChainParams() {
    const chain = await this.indexedDb.getAllValue('chain');

    if (chain.length) return;

    const baseUrl =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()].server;

    const transport = createGrpcWebTransport({
      baseUrl,
    });
    const client = createPromiseClient(ObliviousQuery, transport);

    const chainParameters = new ChainParamsRequest();
    const res = await client.chainParameters(chainParameters);
    await this.indexedDb.putValue('chain', res);
    await this.configApi.setNetworks(res.chainId, this.configApi.getNetwork());
  }

  async getCompactBlockRange() {
    let fvk;
    try {
      fvk = this.configApi.getAccountFullViewingKey();
    } catch (error) {
      fvk = '';
    }
    if (!fvk) {
      return;
    }

    const { server, chainId } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const transport = createGrpcWebTransport({
      baseUrl: server,
    });
    const client = createPromiseClient(ObliviousQuery, transport);

    const compactBlockRangeRequest = new CompactBlockRangeRequest();
    compactBlockRangeRequest.chainId = chainId;
    compactBlockRangeRequest.startHeight =
      this.store.getState().lastSavedBlock[this.configApi.getNetwork()];
    compactBlockRangeRequest.keepAlive = true;
    try {
      for await (const response of client.compactBlockRange(
        compactBlockRangeRequest
      )) {
        this.scanBlock(response, fvk);
        if (Number(response.height) % 100 === 0) {
          const oldState = this.store.getState().lastSavedBlock;

          const lastSavedBlock = {
            ...oldState,
            [this.configApi.getNetwork()]: Number(response.height),
          };

          extension.storage.local.set({
            lastSavedBlock,
          });
        }
      }
    } catch (error) {}
  }

  async scanBlock(compactBlock: CompactBlock, fvk: string) {
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
  }

  async resetWallet() {
    extension.storage.local.set({
      lastSavedBlock: {
        mainnet: 0,
        testnet: 0,
      },
    });
    await this.indexedDb.resetTables('notes');
    await this.indexedDb.resetTables('chain');
    await this.indexedDb.resetTables('assets');
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
