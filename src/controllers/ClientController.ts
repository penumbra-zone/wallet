import {
  createGrpcWebTransport,
  createPromiseClient,
  ConnectError,
  Code,
} from '@bufbuild/connect-web';

import { ExtensionStorage } from '../storage';

import ObservableStore from 'obs-store';
import {
  build_tx,
  decrypt_note,
  encode_tx,
  send_plan,
  ViewClient,
} from 'penumbra-web-assembly';
import { WalletController } from './WalletController';
import { extension } from '../lib';
import { RemoteConfigController } from './RemoteConfigController';
import { NetworkController } from './NetworkController';
import { decode, encode } from 'bech32-buffer';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';
import { WasmViewConnector } from '../utils/WasmViewConnector';
import { ObliviousQueryService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb';
import {
  AssetListRequest,
  AssetListResponse,
  ChainParametersRequest,
  ChainParametersResponse,
  CompactBlockRangeRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb';

import {
  ChainParameters,
  CompactBlock,
  FmdParameters,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';

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

    const { grpc: defaultGrpc, chainId } = this.configApi.getNetworkConfig()[
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

    const { grpc: defaultGrpc } = this.configApi.getNetworkConfig()[
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

    const { grpc: defaultGrpc, chainId } = this.configApi.getNetworkConfig()[
      this.configApi.getNetwork()
    ];

    const grpc = customGrpc || defaultGrpc;

    const lastBlock = await this.getLastExistBlock();

    const transport = createGrpcWebTransport({
      baseUrl: grpc,
    });

    // let note = await this.indexedDb.getValue(
    //     'spendable_notes', "a6ab2d05eb22f99ea0442fc22682eddaab3633d74006b0fec2a58a43a8e6760a"
    // );
    // let fmd = await this.indexedDb.getValue(
    //     'fmd_parameters', `fmd`);
    //
    // let chain_params = await this.indexedDb.getValue(
    //     'chainParameters', "penumbra-testnet-callirrhoe");
    //
    // let data = {
    //     notes: [note],
    //     chain_parameters: snakeize(chain_params),
    //     fmd_parameters: snakeize(fmd)
    //     ,
    // };
    // console.log(data);
    //
    //
    // let sendPlan = send_plan(fvk, {
    //         amount: {
    //             lo: 1000000n,
    //             hi: 0n
    //         },
    //         asset_id: {
    //             inner: "29EA9C2F3371F6A487E7E95C247041F4A356F983EB064E5D2B3BCF322CA96A10"
    //         }
    //
    //     },
    //     "penumbrav2t1u9aysnt5c3lfrfh7pn7qlkxtxwlzt5suqwajcn9k3ehcpqphzf22qtwz0ywcqvqd7z5ma6pdlzjc0wra8mlj36ly7llvz9wjtje3575sknhkjfky36rxnunxp5mzxu0kl9hqkv",
    //     data
    // )
    //
    //
    // console.log("Send plan", sendPlan)
    //
    // let buildTx = build_tx(spending_key, fvk, sendPlan, await this.wasmViewConnector.loadStoredTree());
    //
    // console.log(buildTx)
    //
    // let encodeTx = encode_tx(buildTx);
    // console.log("encoded tx ", encodeTx);
    //
    // let decodeTransaction = decode_transaction("0acc260acd170aca170a680a220a206c6a96255acfeb4bff334872f4dbaf8e337b226371bfffbacb5de6217b9754031a202fc8c268c2f27b96ca4c03801c37c242819a3412b16a2c424c00255a50809e0e222078ad2a4c5d850cef96bf33d0de06676e736c31c5526b6162505c2df0685a570712420a4018665de53be16d8afbf6c72c9c8cb5e897925ee3b284c5a6d8c6bbc7a3c08409ec041d0fea6f0d5d87cfe691f965c8c9d6e7c7a92d3f6933378bdef2f12d83011a99160ae6130a220a20049302d77fdae15d8359397d141aae88a89e07929cf828f7212959843f4f320c10181a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200000000000000000000000000000000000000000000000000000000000000000122000000000000000000000000000000000000000000000000000000000000000001a2000000000000000000000000000000000000000000000000000000000000000001a660a200720054622468208d1ae1651a860caf9a15d13b0da1db97abf06f2036ed1ed0a1220c1d34fb660d29fa26c2c4a389f010bdbccedefdb2bc732eec7473b2235e3c1051a2000000000000000000000000000000000000000000000000000000000000000001a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a206031a4b13b5b34f286e1319116bcef2734e7a7f877998e67cba3ade4be91e40612200183a19d0d968b077b41e7c8f8e28d23bbbee01b519d13a56d5ef69499f00d111a2001000000000000000000000000000000000000000000000000000000000000001a660a200ade6e62adf6ee08a565c9555a2843497f96ed00eb6343e0fc137dd7deb3011012200ade6e62adf6ee08a565c9555a2843497f96ed00eb6343e0fc137dd7deb301101a200ade6e62adf6ee08a565c9555a2843497f96ed00eb6343e0fc137dd7deb301101a660a20331153438d45ee2013af3ccc37bceb4ba82486d7b29b65f5d593dcd8d3e6270d1220331153438d45ee2013af3ccc37bceb4ba82486d7b29b65f5d593dcd8d3e6270d1a20331153438d45ee2013af3ccc37bceb4ba82486d7b29b65f5d593dcd8d3e6270d1a660a206323fb448989d2c3964a933866517b7ed161353bfe51f9426d8b8ad14dc2850f12206323fb448989d2c3964a933866517b7ed161353bfe51f9426d8b8ad14dc2850f1a206323fb448989d2c3964a933866517b7ed161353bfe51f9426d8b8ad14dc2850f1a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a200100000000000000000000000000000000000000000000000000000000000000122001000000000000000000000000000000000000000000000000000000000000001a2001000000000000000000000000000000000000000000000000000000000000001a660a209b3c9d8d568abcae450bdf085e5b95382a687c5148e82fe1be12a79dcdf2cd0d1220baadb5c2d4860587351b85a194259d1e1b4d6916c0898d8d2c1624cfd10f200d1a2001000000000000000000000000000000000000000000000000000000000000001a660a20ee84baf70e680b3274bf82d9a6e0238ef143696682c7824d0f4f6305d375510412205ca942a24d4c617fd4210f48dd713782abad3e6b69519f86e4c62ed221f2780e1a20cb13ebb06993f12fb4b7918590d7422a4b90a10c47ab1e5419d83396f54e6c051a660a20c44e5d8df2c2e22b83770271ea7ec94cca1c376090a9b3b6aa20b28743c1680f12205254e3db5cce1189303e841d9ef81ab1bc257dbc022a8a4d0bc189da567e14021a20e235e5aae708d9425055d2cbeb3e0d85b8b3e8230d4b2f068b66c17d09cb7b0d1a660a20bb49ea8d37566e400042af2e70e047358020e12125bf932b4f937c755d6921071220a1b1cec235091b8c606358a90bf9924d3e37a5ca1e05f13ab5fc1a2029e613081a207e1c51253e2413d000669e44af0e3749f540ee6b1c22c2702150dc3e635c93051a660a2035c915785e6e6f891cc798ad917a9000b4dbc1443434316a71cbb1400bfa090e1220b8326adf04ac628226d20e6518b5214da176bb33f4268e904601ff559f6e040a1a203bd11e7332550e110fb3d6c7ff4f4a7948b7a8e3d8c45cd3bafc9eaeff477e031a660a20a455c364026c6feacde9a1cb335811e3a1101150ab8046050ddfa6c0fa6c4c0e1220eb11e99e1a9cd13909b28422ed400eeb398dd2981ea3e4623e0a47543587470e1a2034ea368e9c01c17df429b0043ba9bfdee0e40a2861e38844e9fd8a5899e2c70612a5010a2d0a070880a094a58d1d12220a2029ea9c2f3371f6a487e7e95c247041f4a356f983eb064e5d2b3bcf322ca96a1012200920096468dc8b1d583640eb9a673ca4dfd8de2b2aa0374a7996a280098b245e1a520a50906a119000ddf54080f9f09d6d595af558ebcea0006e6959ece58df9bf03d854b6fdafddface10700bb9d94e16a2e8b8c78aef0ccbe7931f80dcd7efd1f227e78c5f1e71786e96a17fdf559b44f7305e3220ae32d8aa633388f5e53cdb15cc5540224257fa0e6786894f2e624d7c897da8034a2009f87a8b38c5279139509f922552acac7086f68845d8b87553b94f44dcadf30152207ef3db78334228778e9e48598f8c62675276f69a9f49991a10651ee3d3b39a125a2045430b3ec84910e9418d0f3ae31872ea4f0416fbed64737eb99cb39b09fb9f080ad50412d2040a84030af9010a220a2060c1b43a6fdc047ace4d34a95e35140ea47f09bc682aa80d04f8d9aa9fe33f0d12208a9e5bc267ae747d4ed345bcb759720aaac24987d384ce5be16872942bf941081ab0019b895668aaa643743c70085a9a6c1220d12f5adbd575ebbfb35849c0826e3027c6621f3cb32f333c4cd963fff6b7e5d32ae47593d2ece7d876c22f7cd5d7968f3b996abafa150962b375a933866678ad7a68565bf670c67c297858330afd52a2de4169ee621c0341c3d9438f5fa4401dad6e8b2ee547f4ea9a9ddb04837f24bb75cbba10efab1c10623ee8d6d3c286cdd1fef3a1909b29f1544166764f6818f9a2c63b60613d88fc32bb162bc7b6e39a12220a20a2fcc231f3ad1ddd0a42a2dd5848ec304f6ede305a322a7256c9d35add1ffa041a307d2fe607f74e6a5b2d461df0d4a7b3301a40c3496e5fae908d6ecb3c6cb93063efe7ee4d392f55b3547f456f8d82dbe32230e66cabebf404b05863133d93cf0eae452e34d06c0d3cd806ae8853e4d906cd42da3fee0b3c755fbdbfe3eee44c5251c412c8010aa3010a2b0a050880c2d72f12220a2029ea9c2f3371f6a487e7e95c247041f4a356f983eb064e5d2b3bcf322ca96a101220aabca5319098f735ec422bbf225723aab9f06ecc8d57565009aa57347e5b86451a520a501054b85c2b879ea46fee45f281b28cdfcfb208be6554dc61a8b513dfced8883f6a954940b1e2e6a622a351b7e7979acb3c062d1b130edb2b6ff8825cf819919f5af49a8aaf367dbdd4a1e54a2ad4e7ef2a20edf42bb62e1d73c8c3f4333a55a488c316b07d864b554a2a91e226c3a6c039010ad70412d4040a84030af9010a220a207a1b53b83eb01eac653b7b5a79482eef4155b282be7d88c4023efa0a22fe300112200496b22dfd3d5a1644bd91fcc17159d80f33aa345f83ccea350f4dce8c77cc031ab001886c75c4ace3e5f74bf36609882caca26d28e736d0868d5f5108435c1bcad3219efaf4b257a5a8fc4e8cbe21ca563bacf7b5ee3aeb8af5b3e64e2c31345ad96b27549cdc722efa15b57b95654bc532a76d45ffc03268e1bc01326213d5a8ad8d653b474f2ffdfbdec496d427c8609f0fa117df34f9543dcc31e43c5e7745de0eeab864942b01a872bb5aa6d046b632835b9119695c1a0b776ad0cfa81968fdaf6405dbcc9179ce237bed420586e6fcaf12220a20f88018018da436358517ee4398d06c0f01222a901d6f902c5c89b6a3ffc46a031a30c23e10a789d73326905828efc30012656dfe2e8cd697d7aaedc050daf3e8601866ea63872435fcb393810e894edd6087223074b809868472c54a77fa2160a9f006e21cb27529a2a45e2c3739b803ab1e790457d7e37bb315db131a3a7904cc71e83212ca010aa5010a2d0a070880debcf58c1d12220a2029ea9c2f3371f6a487e7e95c247041f4a356f983eb064e5d2b3bcf322ca96a101220791bae9a72f2dc526b578bd6912b3557ef20386adeab2c00a01297a0e283db861a520a50906a119000ddf54080f9f09d6d595af558ebcea0006e6959ece58df9bf03d854b6fdafddface10700bb9d94e16a2e8b8c78aef0ccbe7931f80dcd7efd1f227e78c5f1e71786e96a17fdf559b44f7305e2a20c7275ed9b43b87766e740b2a366b78f036bbc9869f4f3b7c3a1966282f2899021a2170656e756d6272612d746573746e65742d616472617374652d336536626239376122020a002a460a44be9d29607bafc90d5fc1273986f8e3f92da3964090d692c996a8af46585ec402c2e09d28e9830209c87019b6b6676c9b286722bc877d88ffee303d75ba92df02000000002a460a443cb858d46ee71eeefb9c6fcf4c1e3e3171ba7fc24c77a92f945057847c52b805f7450b640f67958ba860a539151ea3c9b21c44db9fd45bbec806e25cefd7410100000000329004a273944afde4c6a94baada1fe070758df23f38c4d3100110c702f004c4b1b155f849fb8840d906f72edcd3da47648960b73a589bb07b5e53a0d7930a0c1aeeb44de5a0c2fb009ff62e27392ac1c051f5a4a09d27489e418cdcd950f02c2bd74bce0e37e77a1e6a87213360594458810f0d1b3fe39080c2526daa987d61f7aeac9c76817d3ad0f5691854eeef7b4851ae8a510ac50912c34b71ed91f17dd08f0583c7817ed83b0742cf0fea2b51fcc7ba0d1e0f47aa0eb8d2e416f3fca40b0ab8836dfda34633c47743066ebb59182222a8d87b872d1262c69d2b9bc75d2a3157e5736f9f7c9e663ad65c03b8d09106c7ea11a73b78e714e72197e36b7aa22473a30c67982dee267dce4c2fad495fe123950038e17a62ac5b250b9c402bed330a6755ba2cf9138b979e9baba8d5a64981ea05e64ee31eb2538e3eaac2e5a455d9deb55826fc515143e9f72d36c0ecdb24df4e93edb2937bbcda98978c068d3a5a3a5cb8a9b0d35ac80833e105d8dfaba822ee1c05ccfc1f3a4fe656d311990547c9d94e9640dd91ae94025b56a69a818293915c9633e3ab6692b28986c77db0855453eabe20192be129d8636a96efecaaff8a8f8fde20e4ba15cdd25101be11f8c00c73ab6c24db03e50ac745d67bfb05b32085a8d677d97d77d014199fd032cfd6e4c8f48336655085e9d4379cc865685c947e1d901cc1717e133bbef8c7d1beaf4b76fab67309d2be1df2928a62857012404a6bc067beaee0a0bd9e00161b08aba5637a3048f2b1f3d5416fc035cdc6460597accebaa4a551a20b3246c359f1ee1be78d9c0aed77fb0e2fbfdb64ead7ab021a220a20e9bd127283a74012d820001be9a5e8f9bd6a9f0d1451aa7f392ba97862e71b01");
    //
    // console.log("decoded tx ", decodeTransaction);
    //
    //
    // const tendermint = createPromiseClient(TendermintProxyService, transport);
    //
    //
    // let broadcastTxSyncRequest = new BroadcastTxSyncRequest();
    // broadcastTxSyncRequest.params = encodeTx;
    // broadcastTxSyncRequest.reqId =124214123n
    // let broadcastTxSync = await tendermint.broadcastTxSync(broadcastTxSyncRequest);
    //
    // console.log(broadcastTxSync);

    const client = createPromiseClient(ObliviousQueryService, transport);

    const compactBlockRangeRequest = new CompactBlockRangeRequest();

    compactBlockRangeRequest.chainId = chainId;
    compactBlockRangeRequest.startHeight = BigInt(
      this.store.getState().lastSavedBlock[this.configApi.getNetwork()]
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
          fvk
        );

        // await this.scanBlock(response.compactBlock, fvk);

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

  async getLastExistBlock() {
    const { tendermint } = this.configApi.getNetworkConfig()[
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
    const { tendermint } = this.configApi.getNetworkConfig()[
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

  byteArrayToLong = function(/*byte[]*/ byteArray) {
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
