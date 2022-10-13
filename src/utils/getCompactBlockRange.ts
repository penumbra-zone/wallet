import {
  createGrpcWebTransport,
  createPromiseClient,
} from '@bufbuild/connect-web';
import { CompactBlockRangeRequest } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import { ObliviousQuery } from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import { extensionApi } from './extensionApi';

export const getCompactBlockRange = async () => {
  const transport = createGrpcWebTransport({
    baseUrl: 'http://testnet.penumbra.zone:8080',
  });

  const client = createPromiseClient(ObliviousQuery, transport);
  const startHeight = await extensionApi.storage.local.get('startHeight');
  // console.log({ startHeight });

  const compactBlockRangeRequest = new CompactBlockRangeRequest();
  compactBlockRangeRequest.chainId = 'penumbra-testnet-autonoe';
  compactBlockRangeRequest.startHeight = Number(startHeight.startHeight)
    ? BigInt(startHeight.startHeight)
    : BigInt(1);
  compactBlockRangeRequest.keepAlive = true;
  console.log({ compactBlockRangeRequest });

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
