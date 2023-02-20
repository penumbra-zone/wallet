import {
  ChainParameters,
  FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';
import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb';
import { bytesToBase64 } from '../utils/base64';
import { ExtensionStorage } from '../storage';
import { IndexedDb } from '../utils';
import { WalletController } from './WalletController';
import { RemoteConfigController } from './RemoteConfigController';
import { NetworkController } from './NetworkController';
import { build_tx, encode_tx, send_plan } from 'penumbra-web-assembly';
import { WasmViewConnector } from '../utils/WasmViewConnector';
import {
  BroadcastTxAsyncRequest,
  BroadcastTxSyncRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';
import bigInt from 'big-integer';
import { extension } from '../lib';

export class TransactionController {
  indexedDb;

  private configApi;

  private wasmViewConnector;

  constructor({
    indexedDb,
    getAccountFullViewingKey,
    setNetworks,
    getNetwork,
    getNetworkConfig,
    getAccountSpendingKey,
    getCustomGRPC,
    wasmViewConnector,
  }: {
    indexedDb: IndexedDb;
    getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword'];
    getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword'];
    setNetworks: RemoteConfigController['setNetworks'];
    getNetwork: NetworkController['getNetwork'];
    getNetworkConfig: RemoteConfigController['getNetworkConfig'];
    getCustomGRPC: NetworkController['getCustomGRPC'];
    wasmViewConnector: WasmViewConnector;
  }) {
    this.configApi = {
      getAccountFullViewingKey,
      setNetworks,
      getNetwork,
      getNetworkConfig,
      getAccountSpendingKey,
      getCustomGRPC,
    };
    this.indexedDb = indexedDb;
    this.wasmViewConnector = wasmViewConnector;
  }

  async sendTransaction(destAddress: string, amount: number, assetId: string) {
    let fvk;
    let spending_key;
    try {
      fvk = this.configApi.getAccountFullViewingKey();
      spending_key = this.configApi.getAccountSpendingKey();
    } catch (error) {
      fvk = '';
    }

    if (!fvk) {
      return;
    }

    const customGrpc =
      this.configApi.getCustomGRPC()[this.configApi.getNetwork()];

    const { grpc: defaultGrpc, chainId } =
      this.configApi.getNetworkConfig()[this.configApi.getNetwork()];

    const grpc = customGrpc || defaultGrpc;

    const transport = createGrpcWebTransport({
      baseUrl: grpc,
    });

    let notes = await this.indexedDb.getAllValue('spendable_notes');

    notes = notes
      .filter((note) => note.heightSpent === undefined)
      .filter((note) => note.note.value.assetId.inner === assetId);

    if (notes.length === 0) {
      console.error('No notes found to spend');
    }

    let fmd: FmdParameters = await this.indexedDb.getValue(
      'fmd_parameters',
      `fmd`
    );

    if (fmd === undefined) {
      console.error('No found FmdParameters');
    }

    let chain_params_records = await this.indexedDb.getAllValue(
      'chainParameters'
    );
    let chain_params = await chain_params_records[0];

    if (fmd === undefined) {
      console.error('No found chain parameters');
    }

    let data = {
      notes: notes,
      chain_parameters: chain_params,
      fmd_parameters: fmd,
    };

    let sendPlan = send_plan(
      fvk,
      {
        amount: {
          lo: amount * 1000000,
          hi: 0n,
        },
        assetId: notes[0].note.value.assetId,
      },
      destAddress,
      data
    );

    console.log(sendPlan);
    
    // sendPlan - action array

    let buildTx = build_tx(
      spending_key,
      fvk,
      sendPlan,
      await this.wasmViewConnector.loadStoredTree()
    );

    let encodeTx = await encode_tx(buildTx);

    let resp = await this.broadcastTx(bytesToBase64(encodeTx));

    // if (resp.result.code === 0) {
    //     extension.notifications.create(resp.id, {
    //       type: 'basic',
    //       iconUrl: 'assets/img/logo.png',
    //       title: 'Transaction Confirmed',
    //       message:
    //         'Transaction with hash 0x' +
    //         resp.result.hash +
    //         ' successfully confirmed',
    //       priority: 1,
    //     });
    // } else  {
    //     extension.notifications.create(resp.id, {
    //       type: 'basic',
    //       iconUrl: 'assets/img/logo.png',
    //       title: 'Transaction Error',
    //       message:
    //         'Error submitting transaction: code ' +
    //         resp.result.code +
    //         ', log: ' +
    //         resp.result.log,
    //       priority: 1,
    //     });
    // }

    // const tendermint = createPromiseClient(TendermintProxyService, transport);
    // let broadcastTxSyncRequest = new BroadcastTxSyncRequest();
    // broadcastTxSyncRequest.params = encodeTx;
    // broadcastTxSyncRequest.reqId = BigInt(id)
    // let broadcastTxSync = await tendermint.broadcastTxSync(broadcastTxSyncRequest);
  }

  getRandomInt() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  toHexString(bytes: any) {
    return bytes.reduce(
      (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
      ''
    );
  }

  async broadcastTx(tx_bytes_hex: string) {
    const broadcastResponse = await fetch(
      'http://testnet.penumbra.zone:26657',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'broadcast_tx_sync',
          params: [tx_bytes_hex],
          id: this.getRandomInt(),
        }),
      }
    );
    const content = await broadcastResponse.json();

    return content;
  }
}
