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
import { extension } from '../lib';
import { RemoteConfigController } from './RemoteConfigController';
import { NetworkController } from './NetworkController';
import { encode } from 'bech32-buffer';

export class ClientController {
  store;
  db;
  extensionStorage;
  indexedDb;
  private configApi;
  clientCompactBlocRange;

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
        lastBlockHeight: {
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
      id: encode('passet', asset.id?.inner, 'bech32m'),
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

    const lastBlock = await this.getLastExistBlock();

    const transport = createGrpcWebTransport({
      baseUrl: server,
    });
    const client = createPromiseClient(ObliviousQuery, transport);

    const compactBlockRangeRequest = new CompactBlockRangeRequest();
    compactBlockRangeRequest.chainId = chainId;
    compactBlockRangeRequest.startHeight = BigInt(
      this.store.getState().lastSavedBlock[this.configApi.getNetwork()]
    );
    compactBlockRangeRequest.keepAlive = true;
    try {
      for await (const response of client.compactBlockRange(
        compactBlockRangeRequest
      )) {
        // console.log('handle new block height = : ', response.height);
        this.scanBlock(response, fvk);
        if (Number(response.height) < lastBlock) {
          if (Number(response.height) % 100000 === 0) {
            const oldState = this.store.getState().lastSavedBlock;

            const lastSavedBlock = {
              ...oldState,
              [this.configApi.getNetwork()]: Number(response.height),
            };

            extension.storage.local.set({
              lastSavedBlock,
            });
          }
        } else {
          const oldState = this.store.getState().lastSavedBlock;

          const lastSavedBlock = {
            ...oldState,
            [this.configApi.getNetwork()]: Number(response.height),
          };

          const oldLastBlockHeight = this.store.getState().lastBlockHeight;

          const lastBlockHeight = {
            ...oldLastBlockHeight,
            [this.configApi.getNetwork()]: Number(response.height),
          };

          extension.storage.local.set({
            lastSavedBlock,
            lastBlockHeight,
          });
        }
      }
    } catch (error) {}
  }

  async getLastExistBlock() {
    const { tendermint } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const response = await fetch(`${tendermint}/abci_info`);
    const data = await response.json();

    const lastBlock = Number(data.result.response.last_block_height);
    const oldLastBlockHeight = this.store.getState().lastBlockHeight;

    const lastBlockHeight = {
      ...oldLastBlockHeight,
      [this.configApi.getNetwork()]: lastBlock,
    };

    this.store.updateState({ lastBlockHeight });

    return lastBlock;
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
          decryptedNote.height = compactBlock.height;
          decryptedNote.note_commitment = this.toHexString(
            notePayload.payload?.noteCommitment.inner
          );
          decryptedNote.ephemeralKey = this.toHexString(
            notePayload.payload?.ephemeralKey
          );
          decryptedNote.amount = this.byteArrayToLong(
            decryptedNote.value.amount.inner
          );
          decryptedNote.asset = decryptedNote.value.asset_id;
          console.log('decrypted note: ', decryptedNote);

          if (decryptedNote.amount != 0) {
            await this.indexedDb.putValue('notes', decryptedNote);
          }

          const oldState = this.store.getState().lastSavedBlock;

          const lastSavedBlock = {
            ...oldState,
            [this.configApi.getNetwork()]: Number(compactBlock.height),
          };
          extension.storage.local.set({
            lastSavedBlock,
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  byteArrayToLong = function (/*byte[]*/ byteArray) {
    var value = 0;
    for (var i = byteArray.length - 1; i >= 0; i--) {
      value = value * 256 + byteArray[i];
    }

    return value;
  };

  async resetWallet() {
    extension.storage.local.set({
      lastSavedBlock: {
        mainnet: 0,
        testnet: 0,
      },
      lastBlockHeight: {
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
