import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';

import { ObliviousQueryService } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { ExtensionStorage } from '../storage';
import {
  AssetListRequest,
  AssetListResponse,
  ChainParametersRequest,
  ChainParametersResponse,
  CompactBlockRangeRequest,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import ObservableStore from 'obs-store';

import {
  ChainParameters,
  CompactBlock,
  FmdParameters,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { decrypt_note } from 'penumbra-web-assembly';
import { WalletController } from './WalletController';
import { extension } from '../lib';
import { RemoteConfigController } from './RemoteConfigController';
import { NetworkController } from './NetworkController';
import { encode } from 'bech32-buffer';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';

export type Transaction = {
  block_height: number;
  tx_bytes: string;
  tx_hash: string;
};

export type NoteType = {
  address: string;
  amount: number;
  asset: string;
  ephemeralKey: string;
  height:number;
  note_blinding: string;
  note_commitment: string;
  nullifier: string[];
  source: string;
  value: {
    amount: { hi: number; lo: number };
    asset_id: string;
  };
};

export class ClientController {
  store;
  db;
  extensionStorage;
  indexedDb;
  private configApi;

  constructor({
    extensionStorage,
    indexedDb,
    getAccountFullViewingKey,
    setNetworks,
    getNetwork,
    getNetworkConfig,
  }: {
    extensionStorage: ExtensionStorage;
    indexedDb: IndexedDb;
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
    this.indexedDb = indexedDb;
  }

  async saveAssets() {
    const savedAssets: EncodeAsset[] = await this.indexedDb.getAllValue(
      'assets'
    );

    if (savedAssets.length) return;

    const { grpc, chainId } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const transport = createGrpcWebTransport({
      baseUrl: grpc,
    });
    const client = createPromiseClient(ObliviousQueryService, transport);

    const assetRequest = new AssetListRequest();
    assetRequest.chainId = chainId;

    const asset: AssetListResponse = await client.assetList(assetRequest);

    const encodeAsset: EncodeAsset[] = asset.assetList.assets.map((asset) => ({
      id: encode('passet', asset.id?.inner, 'bech32m'),
      denom: asset.denom?.denom,
    }));

    await this.indexedDb.putBulkValue('assets', encodeAsset);
  }

  async saveChainParameters() {
    const savedChainParameters: ChainParameters[] =
      await this.indexedDb.getAllValue('chainParameters');

    if (savedChainParameters.length) return;

    const baseUrl =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()].grpc;

    const transport = createGrpcWebTransport({
      baseUrl,
    });
    const client = createPromiseClient(ObliviousQueryService, transport);

    const chainParametersRequest = new ChainParametersRequest();

    const chainParameters: ChainParametersResponse =
      await client.chainParameters(chainParametersRequest);

    await this.indexedDb.putValue(
      'chainParameters',
      chainParameters.chainParameters
    );

    await this.configApi.setNetworks(
      chainParameters.chainParameters.chainId,
      this.configApi.getNetwork()
    );
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

    const { grpc, chainId } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const lastBlock = await this.getLastExistBlock();

    const transport = createGrpcWebTransport({
      baseUrl: grpc,
    });

    const client = createPromiseClient(ObliviousQueryService, transport);

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
        await this.scanBlock(response.compactBlock, fvk);
        if (Number(response.compactBlock.height) < lastBlock) {
          if (Number(response.compactBlock.height) % 10000 === 0) {
            const oldState = this.store.getState().lastSavedBlock;
            const lastSavedBlock = {
              ...oldState,
              [this.configApi.getNetwork()]: Number(
                response.compactBlock.height
              ),
            };
            extension.storage.local.set({
              lastSavedBlock,
            });
          }
        } else {
          const oldState = this.store.getState().lastSavedBlock;
          const lastSavedBlock = {
            ...oldState,
            [this.configApi.getNetwork()]: Number(response.compactBlock.height),
          };
          const oldLastBlockHeight = this.store.getState().lastBlockHeight;
          const lastBlockHeight = {
            ...oldLastBlockHeight,
            [this.configApi.getNetwork()]: Number(response.compactBlock.height),
          };

          this.store.updateState({ lastBlockHeight, lastSavedBlock });
        }
      }
    } catch (error) {}
  }

  async getLastExistBlock() {
    const { tendermint } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const response = await fetch(`${tendermint}/abci_info`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
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
      for (const statePayload of compactBlock.statePayloads) {
        try {
          if (statePayload.statePayload.case === 'note') {
            let statePayloadNote = statePayload.statePayload.value;

            let decryptedNote = decrypt_note(
              fvk,
              this.toHexString(statePayloadNote.note.encryptedNote),
              this.toHexString(statePayloadNote.note.ephemeralKey)
            );
            if (decryptedNote === null) continue;

            decryptedNote.height = Number(compactBlock.height);
            decryptedNote.note_commitment = this.toHexString(
              statePayloadNote.note.noteCommitment.inner
            );
            decryptedNote.ephemeralKey = this.toHexString(
              statePayloadNote.note.ephemeralKey
            );
            decryptedNote.amount = decryptedNote.value.amount.lo;

            decryptedNote.asset = decryptedNote.value.asset_id;
            decryptedNote.nullifier = compactBlock.nullifiers.map((i) =>
              this.toHexString(i.inner)
            );
            decryptedNote.source = this.toHexString(
              statePayloadNote.source.inner
            );

            if (decryptedNote.amount != 0) {
              await this.indexedDb.putValue('notes', decryptedNote);
            }
            await this.saveTransaction(
              compactBlock.height,
              decryptedNote.source
            );

            const oldState = this.store.getState().lastSavedBlock;

            const lastSavedBlock = {
              ...oldState,
              [this.configApi.getNetwork()]: Number(compactBlock.height),
            };
            extension.storage.local.set({
              lastSavedBlock,
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (compactBlock.fmdParameters !== undefined)
        await this.saveFmdParameters(compactBlock.fmdParameters);
    }
  }

  async saveFmdParameters(fmdParameters: FmdParameters) {
    console.log(fmdParameters);
    await this.indexedDb.resetTables('fmd_parameters');
    await this.indexedDb.putValue('fmd_parameters', fmdParameters);
  }

  async saveTransaction(height: bigint, sourceHex: string) {
    const { tendermint } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const response = await fetch(`${tendermint}/tx?hash=0x${sourceHex}`, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const data = await response.json();

    let tx: Transaction = {
      tx_hash: sourceHex,
      tx_bytes: data.result.tx,
      block_height: Number(height),
    };

    await this.indexedDb.putValue('tx', tx);
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
    await this.indexedDb.resetTables('chainParameters');
    await this.indexedDb.resetTables('assets');
    await this.indexedDb.resetTables('tx');
    await this.indexedDb.resetTables('fmd_parameters');
    await this.indexedDb.resetTables('nct_commitments');
    await this.indexedDb.resetTables('nct_forgotten');
    await this.indexedDb.resetTables('nct_hashes');
    await this.indexedDb.resetTables('nct_position');
    await this.indexedDb.resetTables('spendable_notes');
    await this.indexedDb.resetTables('tx_by_nullifier');
  }

  requireScanning(compactBlock: CompactBlock) {
    return (
      compactBlock.statePayloads != null &&
      compactBlock.statePayloads.length != 0
    );
  }

  toHexString(bytes: any) {
    return bytes.reduce(
      (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
      ''
    );
  }
}
