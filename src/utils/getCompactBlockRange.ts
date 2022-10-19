import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';
import {
  CompactBlockRangeRequest,
  AssetListRequest,
  ChainParamsRequest,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import { ObliviousQuery } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { extensionApi } from './extensionApi';
import {
  KnownAssets,
  ChainParameters,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import IndexedDb from './IndexedDb';

const CHAIN_ID = 'penumbra-testnet-chaldene';

const transport = createGrpcWebTransport({
  baseUrl: 'http://testnet.penumbra.zone:8080',
});

const client = createPromiseClient(ObliviousQuery, transport);

export const getAssets = async () => {
  const assetsRequest = new AssetListRequest();
  assetsRequest.chainId = CHAIN_ID;

  const res: KnownAssets = await client.assetList(assetsRequest);
  const newRes = res.assets.map((asset) => ({
    id: asset.id?.inner,
    denom: asset.denom?.denom,
  }));

  const indexedDb = new IndexedDb('penumbra_assets');
  await indexedDb.createObjectStore(['assets'], 'denom');
  await indexedDb.putBulkValue('assets', newRes);
};

export const getChainParams = async () => {
  const chainParameters = new ChainParamsRequest();
  chainParameters.chainId = CHAIN_ID;

  const res: ChainParameters = await client.chainParameters(chainParameters);

  const indexedDb = new IndexedDb('penumbra_chain');
  await indexedDb.createObjectStore(['chain'], 'chainId');
  await indexedDb.putValue('chain', res);
};

export const getCompactBlockRange = async () => {
  const startHeight = await extensionApi.storage.local.get('startHeight');

  const compactBlockRangeRequest = new CompactBlockRangeRequest();
  compactBlockRangeRequest.chainId = CHAIN_ID;
  compactBlockRangeRequest.startHeight = Number(startHeight.startHeight)
    ? BigInt(startHeight.startHeight)
    : BigInt(1);
  compactBlockRangeRequest.keepAlive = true;

  try {
    for await (const response of client.compactBlockRange(
      compactBlockRangeRequest
    )) {
      extensionApi.storage.local.set({ startHeight: Number(response.height) });
    }
  } catch (error) {
    console.log(error);
  }
};
