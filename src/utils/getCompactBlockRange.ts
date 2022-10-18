import {
    createGrpcWebTransport,
    createPromiseClient,
} from '@bufbuild/connect-web';
import {
    CompactBlockRangeRequest
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';
import {
    ObliviousQuery
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_connectweb';
import {extensionApi} from './extensionApi';
import {CompactBlock} from "@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb";
import {decrypt_note} from "penumbra-web-assembly";

export const getCompactBlockRange = async () => {
    const transport = createGrpcWebTransport({
        baseUrl: 'http://testnet.penumbra.zone:8080',
    });

    const client = createPromiseClient(ObliviousQuery, transport);
    const startHeight = await extensionApi.storage.local.get('startHeight');
    // console.log({ startHeight });

    const compactBlockRangeRequest = new CompactBlockRangeRequest();
    compactBlockRangeRequest.chainId = 'penumbra-testnet-chaldene';
    compactBlockRangeRequest.startHeight = Number(startHeight.startHeight)
        ? BigInt(startHeight.startHeight)
        : BigInt(1);
    compactBlockRangeRequest.keepAlive = true;
    console.log({compactBlockRangeRequest});

    try {
        for await (const response of client.compactBlockRange(
            compactBlockRangeRequest
        )) {
            console.log("Handle block with height " + response.height)
            scanBlock(response);
            extensionApi.storage.local.set({startHeight: Number(response.height)});
        }
    } catch (error) {
        console.error(error);
    }
};

export const scanBlock = (compactBlock: CompactBlock) => {
    if (requireScanning(compactBlock)) {
        for (const notePayload of compactBlock.notePayloads) {

            try {

                let decryptedNote = decrypt_note("penumbrafullviewingkey1lsl0y4d2d8xxhh33yppkw06whdszn7h2w55swtxaqzadej6lmsqzg9aygg0jz896zy3huf9vldeqvxr5vtx2ddltj7r46gulfw33yqqyr5ghl",
                    toHexString(notePayload.payload?.encryptedNote),
                    toHexString(notePayload.payload?.ephemeralKey));
                console.log("decryptedNote = ", decryptedNote)

                // TODO save notes
            } catch (e) {
                console.error(e)
            }
        }
    }
};

export const requireScanning = (compactBlock: CompactBlock) => {
    return (compactBlock.notePayloads != null && compactBlock.notePayloads.length != 0)
}

const toHexString = (bytes: any) =>
    bytes.reduce((str: any, byte: any) => str + byte.toString(16).padStart(2, '0'), '');



