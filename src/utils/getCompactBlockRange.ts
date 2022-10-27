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
  ChainParameters, CompactBlock,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import IndexedDb from './IndexedDb';
import {decrypt_note} from "penumbra-web-assembly";

const CHAIN_ID = 'penumbra-testnet-chaldene';

const transport = createGrpcWebTransport({
  baseUrl: 'http://testnet.penumbra.zone:8080',
});

const client = createPromiseClient(ObliviousQuery, transport);

export const getAssets = async () => {
  console.log("getting assets")

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
  console.log("getting chain params")
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
      scanBlock(response);
      extensionApi.storage.local.set({ startHeight: Number(response.height) });
    }
  } catch (error) {
    console.log(error);
  }
};

export const scanBlock = (compactBlock: CompactBlock) => {
  console.log("Handle block with height " + compactBlock.height)
  if (requireScanning(compactBlock)) {
    for (const notePayload of compactBlock.notePayloads) {
      try {

        // TODO replace hardcode string with FVK from local storage
        let decryptedNote = decrypt_note("penumbrafullviewingkey1lsl0y4d2d8xxhh33yppkw06whdszn7h2w55swtxaqzadej6lmsqzg9aygg0jz896zy3huf9vldeqvxr5vtx2ddltj7r46gulfw33yqqyr5ghl",
            toHexString(notePayload.payload?.encryptedNote),
            toHexString(notePayload.payload?.ephemeralKey));
        console.log("decrypted note: ", decryptedNote)

        // TODO save notes

      } catch (e) {
        console.error(e)
      }
    }
  } else
    console.log("skip empty block with height " + compactBlock.height)

};

export const requireScanning = (compactBlock: CompactBlock) => {
  return (compactBlock.notePayloads != null && compactBlock.notePayloads.length != 0)
}

const toHexString = (bytes: any) =>
    bytes.reduce((str: any, byte: any) => str + byte.toString(16).padStart(2, '0'), '');
