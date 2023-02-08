import {
    createGrpcWebTransport,
    createPromiseClient,
    ConnectError,
    Code,
} from '@bufbuild/connect-web';

import {ExtensionStorage} from '../storage';

import ObservableStore from 'obs-store';
import {
    build_tx, decode_transaction,
    decrypt_note,
    encode_tx,
    send_plan,
    ViewClient,
} from 'penumbra-web-assembly';
import {WalletController} from './WalletController';
import {extension} from '../lib';
import {RemoteConfigController} from './RemoteConfigController';
import {NetworkController} from './NetworkController';
import {decode, encode} from 'bech32-buffer';
import {EncodeAsset} from '../types';
import {IndexedDb} from '../utils';
import {WasmViewConnector} from '../utils/WasmViewConnector';
import {
    ObliviousQueryService, TendermintProxyService
} from '@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb';
import {
    AssetListRequest,
    AssetListResponse, BroadcastTxSyncRequest,
    ChainParametersRequest,
    ChainParametersResponse,
    CompactBlockRangeRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';

import {
    ChainParameters,
    CompactBlock,
    FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';
import {bytesToBase64} from "../utils/base64";

export type Transaction = {
    txHashHex: string;
    blockHeight: bigint;
    txBytes: string;
    txHash: Uint8Array;
};

export class ClientController {
    store;
    db;
    extensionStorage;
    indexedDb;
    private configApi;
    private wasmViewConnector;
    //abort all grpc request
    private abortController: AbortController;

    constructor({
                    extensionStorage,
                    indexedDb,
                    getAccountFullViewingKey,
                    setNetworks,
                    getNetwork,
                    getNetworkConfig,
                    wasmViewConnector,
                    getAccountSpendingKey,
                    getCustomGRPC,
                }: {
        extensionStorage: ExtensionStorage;
        indexedDb: IndexedDb;
        getAccountFullViewingKey: WalletController['getAccountFullViewingKeyWithoutPassword'];
        getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword'];
        setNetworks: RemoteConfigController['setNetworks'];
        getNetwork: NetworkController['getNetwork'];
        getNetworkConfig: RemoteConfigController['getNetworkConfig'];
        wasmViewConnector: WasmViewConnector;
        getCustomGRPC: NetworkController['getCustomGRPC'];
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
            getAccountSpendingKey,
            getCustomGRPC,
        };
        extensionStorage.subscribe(this.store);
        this.indexedDb = indexedDb;
        this.wasmViewConnector = wasmViewConnector;
    }

    async saveAssets() {
        const savedAssets: EncodeAsset[] = await this.indexedDb.getAllValue(
            'assets'
        );

        if (savedAssets.length) return;

        const customGrpc = this.configApi.getCustomGRPC()[
            this.configApi.getNetwork()
            ];

        const {grpc: defaultGrpc, chainId} = this.configApi.getNetworkConfig()[
            this.configApi.getNetwork()
            ];

        const grpc = customGrpc || defaultGrpc;

        const transport = createGrpcWebTransport({
            baseUrl: grpc,
        });
        const client = createPromiseClient(ObliviousQueryService, transport);

        const assetRequest = new AssetListRequest();
        assetRequest.chainId = chainId;

        const asset: AssetListResponse = await client.assetList(assetRequest);

        const encodeAsset = asset.assetList.assets.map((asset) => ({
            ...asset,
            decodeId: encode('passet', asset.id?.inner, 'bech32m'),
        }));

        await this.indexedDb.putBulkValue('assets', encodeAsset);
    }

    async saveChainParameters() {
        const savedChainParameters: ChainParameters[] = await this.indexedDb.getAllValue(
            'chainParameters'
        );

        if (savedChainParameters.length) return;

        const customGrpc = this.configApi.getCustomGRPC()[
            this.configApi.getNetwork()
            ];

        const {grpc: defaultGrpc} = this.configApi.getNetworkConfig()[
            this.configApi.getNetwork()
            ];

        const grpc = customGrpc || defaultGrpc;

        const transport = createGrpcWebTransport({
            baseUrl: grpc,
        });
        const client = createPromiseClient(ObliviousQueryService, transport);

        const chainParametersRequest = new ChainParametersRequest();

        const chainParameters: ChainParametersResponse = await client.chainParameters(
            chainParametersRequest
        );

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

        const customGrpc = this.configApi.getCustomGRPC()[
            this.configApi.getNetwork()
            ];

        const {grpc: defaultGrpc, chainId} = this.configApi.getNetworkConfig()[
            this.configApi.getNetwork()
            ];

        const grpc = customGrpc || defaultGrpc;

        const lastBlock = await this.getLastExistBlock();

        const transport = createGrpcWebTransport({
            baseUrl: grpc,
        });

        const client = createPromiseClient(ObliviousQueryService, transport);

        const compactBlockRangeRequest = new CompactBlockRangeRequest();

        compactBlockRangeRequest.chainId = chainId;
        compactBlockRangeRequest.startHeight = BigInt(
            this.store.getState().lastSavedBlock[this.configApi.getNetwork()] === 0 ? 0 :
                this.store.getState().lastSavedBlock[this.configApi.getNetwork()]+1
        );
        compactBlockRangeRequest.keepAlive = true;
        this.abortController = new AbortController();
        try {
            for await (const response of client.compactBlockRange(
                compactBlockRangeRequest,
                {
                    signal: this.abortController.signal,
                }
            )) {
                await this.wasmViewConnector.handleNewCompactBlock(
                    response.compactBlock,
                    fvk,
                    transport
                );

                if (Number(response.compactBlock.height) < lastBlock) {
                    if (Number(response.compactBlock.height) % 1000 === 0) {
                        await this.wasmViewConnector.loadUpdates();
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
                    await this.wasmViewConnector.loadUpdates();
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

                    this.store.updateState({
                        lastBlockHeight,
                        lastSavedBlock,
                    });
                }
            }
        } catch (error) {
            if (error instanceof ConnectError && error.code === Code.Canceled) {
                // this.abortController = new AbortController();
            }
        }
    }

        async broadcastTx(tx_bytes_hex: string) {

        const broadcastResponse = await fetch('http://testnet.penumbra.zone:26657', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "method": "broadcast_tx_sync",
                "params": [tx_bytes_hex],
                "id": 31221,
            })
        });
        const content = await broadcastResponse.json();

        return content;

    }

    async getLastExistBlock() {
        const {tendermint} = this.configApi.getNetworkConfig()[
            this.configApi.getNetwork()
            ];

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

        this.store.updateState({lastBlockHeight});

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

                        // decryptedNote.height = Number(compactBlock.height);
                        // decryptedNote.note_commitment = this.toHexString(
                        //   statePayloadNote.note.noteCommitment.inner
                        // );
                        // decryptedNote.ephemeralKey = this.toHexString(
                        //   statePayloadNote.note.ephemeralKey
                        // ); // ??
                        // decryptedNote.amount = decryptedNote.value.amount.lo; //??

                        // decryptedNote.asset = decryptedNote.value.asset_id;//??
                        // decryptedNote.nullifier = compactBlock.nullifiers.map((i) =>
                        //   this.toHexString(i.inner)
                        // );//?
                        // decryptedNote.source = this.toHexString(
                        //   statePayloadNote.source.inner
                        // ); //?

                        if (decryptedNote.value.amount.lo !== 0) {
                            const savedNote = {
                                noteCommitmentHex: this.toHexString(
                                    statePayloadNote.note.noteCommitment.inner
                                ),
                                noteCommitment: statePayloadNote.note.noteCommitment,
                                // why we return 1 nullifier, if we have few nullifiers
                                // nullifier:{inner: new TextEncoder().encode(compactBlock.nullifiers)},
                                nullifier: compactBlock.nullifiers,
                                heightCreated: compactBlock.height,
                                source: statePayloadNote.source,
                                // addressIndex change to {inner: bytes}
                                addressIndex: BigInt(0),
                                note: {
                                    noteBlinding: new TextEncoder().encode(
                                        decryptedNote.note_blinding
                                    ),
                                    address: {
                                        inner: new TextEncoder().encode(decryptedNote.address),
                                    },
                                    value: {
                                        amount: {
                                            lo: BigInt(decryptedNote.value.amount.lo),
                                            hi: BigInt(decryptedNote.value.amount.hi),
                                        },
                                        assetId: {
                                            inner: new TextEncoder().encode(
                                                decryptedNote.value.asset_id
                                            ),
                                        },
                                    },
                                },
                            };

                            await this.indexedDb.putValue('notes', savedNote);
                        }
                        await this.saveTransaction(
                            compactBlock.height,
                            statePayloadNote.source.inner
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
        await this.indexedDb.resetTables('fmd_parameters');
        await this.indexedDb.putValue('fmd_parameters', fmdParameters);
    }

    async saveTransaction(height: bigint, sourceHex: Uint8Array) {
        const {tendermint} = this.configApi.getNetworkConfig()[
            this.configApi.getNetwork()
            ];

        const response = await fetch(
            `${tendermint}/tx?hash=0x${this.toHexString(sourceHex)}`,
            {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            }
        );
        const data = await response.json();

        const tx: Transaction = {
            txHashHex: this.toHexString(sourceHex),
            txHash: sourceHex,
            txBytes: data.result.tx,
            blockHeight: height,
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
        await this.indexedDb.resetTables('swaps');

        this.store.updateState({
            lastSavedBlock: {
                mainnet: 0,
                testnet: 0,
            },
            lastBlockHeight: {
                mainnet: 0,
                testnet: 0,
            },
        });
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

    abortGrpcRequest() {
        this.abortController.abort();
    }
}
