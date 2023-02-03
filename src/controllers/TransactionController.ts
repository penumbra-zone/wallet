import {
    ChainParameters,
    FmdParameters
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb";
import {
    createGrpcWebTransport,
    createPromiseClient,
} from '@bufbuild/connect-web';
import {
    TendermintProxyService
} from "@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb";
import {bytesToBase64} from "../utils/base64";
import {ExtensionStorage} from "../storage";
import {IndexedDb} from "../utils";
import {WalletController} from "./WalletController";
import {RemoteConfigController} from "./RemoteConfigController";
import {NetworkController} from "./NetworkController";
import {build_tx, encode_tx, send_plan} from "penumbra-web-assembly";
import {WasmViewConnector} from "../utils/WasmViewConnector";
import {BroadcastTxSyncRequest} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb";


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

    async sendTransaction(destAddress: string, amount: number) {
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

        const transport = createGrpcWebTransport({
            baseUrl: grpc,
        });

        let note = await this.indexedDb.getValue(
            'spendable_notes', "zH5DfVO/cnYl2tHRSrNYev1ZgApFI28pwaWaXDFUlAA="
        );
        let fmd: FmdParameters = await this.indexedDb.getValue(
            'fmd_parameters', `fmd`);

        let chain_params: ChainParameters = await this.indexedDb.getValue(
            'chainParameters', "penumbra-testnet-adraste");


        console.log(chain_params);
        let data = {
            notes: [note],
            chain_parameters: chain_params,
            fmd_parameters: fmd
            ,
        };
        console.log(data);


        let sendPlan = send_plan(fvk, {
                amount: {
                    lo: amount * 1000000,
                    hi: 0n
                },
                assetId: note.note.value.assetId

            },
            destAddress,
            data
        )


        console.log("Send plan", sendPlan)
        console.log("Send plan JSON", JSON.stringify(sendPlan))


        let buildTx = build_tx(spending_key, fvk, sendPlan, await this.wasmViewConnector.loadStoredTree());

        console.log(buildTx)
        console.log("Tx JSON", JSON.stringify(buildTx))


        let encodeTx = encode_tx(buildTx);
        console.log("encoded tx ", encodeTx);

        console.log("hex", this.toHexString(encodeTx))

        const tendermint = createPromiseClient(TendermintProxyService, transport);


        let resp = await this.broadcastTx(bytesToBase64(encodeTx));

        console.log(resp);

        let broadcastTxSyncRequest = new BroadcastTxSyncRequest();
        broadcastTxSyncRequest.params = encodeTx;
        broadcastTxSyncRequest.reqId = 124214123n
        let broadcastTxSync = await tendermint.broadcastTxSync(broadcastTxSyncRequest);

        console.log(broadcastTxSync);
    }

    toHexString(bytes: any) {
        return bytes.reduce(
            (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
            ''
        );
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
}

