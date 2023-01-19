import {
  ChainParameters,
  FmdParameters,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { ClientController, Transaction } from '../controllers';
import { ExtensionStorage } from '../storage';
import { EncodeAsset } from '../types';
import { IndexedDb } from '../utils';
import { decode_transaction } from 'penumbra-web-assembly';
import {
  AssetsRequest,
  AssetsResponse,
  FMDParametersRequest,
  FMDParametersResponse,
  NoteByCommitmentRequest,
  NoteByCommitmentResponse,
  NotesRequest,
  NotesResponse,
  StatusRequest,
  StatusResponse,
  TransactionByHashRequest,
  TransactionByHashResponse,
  TransactionHashesRequest,
  TransactionHashesResponse,
  TransactionsRequest,
  TransactionsResponse,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/view/v1alpha1/view_pb';
import {
  ChainParametersRequest,
  ChainParametersResponse,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';

const areEqual = (first, second) =>
  first.length === second.length &&
  first.every((value, index) => value === second[index]);

export class ViewProtocolService {
  private indexedDb;
  private extensionStorage;
  private getLastExistBlock;

  constructor({
    indexedDb,
    extensionStorage,
    getLastExistBlock,
  }: {
    indexedDb: IndexedDb;
    extensionStorage: ExtensionStorage;
    getLastExistBlock: ClientController['getLastExistBlock'];
  }) {
    this.indexedDb = indexedDb;
    this.extensionStorage = extensionStorage;
    this.getLastExistBlock = getLastExistBlock;
  }

  async getAssets(request?: AssetsRequest) {
    const assets: EncodeAsset[] = await this.indexedDb.getAllValue('assets');

    const response = assets.map((i) => {
      return new AssetsResponse({
        asset: {
          denom: i.denom,
          id: i.id,
        },
      }).toBinary();
    });

    return response;
  }

  async getChainParameters(request?: ChainParametersRequest) {
    const chainParameters: ChainParameters[] = await this.indexedDb.getAllValue(
      'chainParameters'
    );
    const response = new ChainParametersResponse({
      chainParameters: chainParameters[0],
    }).toBinary();

    return response;
  }

  async getNotes(request?: NotesRequest) {
    const notes = await this.indexedDb.getAllValue('notes');

    return notes.map((i) => {
      return new NotesResponse({
        noteRecord: { ...i, noteCommitmentHex: undefined },
      }).toBinary();
    });
  }

  async getNoteByCommitment(request: object) {
    const decodeRequest = new NoteByCommitmentRequest().fromBinary(
      new Uint8Array(Object.values(request))
    );

    const notes = await this.indexedDb.getAllValue('notes');

    const selectedNote = notes.find((i) => {
      return areEqual(
        i.noteCommitment.inner,
        decodeRequest.noteCommitment.inner
      );
    });

    if (!selectedNote) {
      throw new Error('Note doesn`t exist');
    }
    return new NoteByCommitmentResponse({
      spendableNote: { ...selectedNote, noteCommitmentHex: undefined },
    }).toBinary();
  }

  async getStatus(request?: StatusRequest) {
    const { lastSavedBlock } = await this.extensionStorage.getState(
      'lastSavedBlock'
    );
    const lasBlock = await this.getLastExistBlock();

    return new StatusResponse({
      syncHeight: lastSavedBlock.testnet,
      catchingUp: lastSavedBlock.testnet === lasBlock,
    }).toBinary();
  }

  async getTransactionHashes(request?: object) {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    const decodeRequest = new TransactionHashesRequest().fromBinary(
      new Uint8Array(Object.values(request))
    );

    let data: Transaction[] = [];
    if (decodeRequest.startHeight && decodeRequest.endHeight) {
      data = tx.filter(
        (i) =>
          i.blockHeight >= decodeRequest.startHeight &&
          i.blockHeight <= decodeRequest.endHeight
      );
    } else if (decodeRequest.startHeight && !decodeRequest.endHeight) {
      data = tx.filter((i) => i.blockHeight >= decodeRequest.startHeight);
    } else {
      data = tx;
    }

    return data.map((i) => {
      return new TransactionHashesResponse({
        blockHeight: i.blockHeight,
        txHash: i.txHash,
      }).toBinary();
    });
  }

  async getTransactionByHash(request: object) {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');

    const decodeRequest = new TransactionByHashRequest().fromBinary(
      new Uint8Array(Object.values(request))
    );

    const selectedTx = tx.find((t) => areEqual(t.txHash, decodeRequest.txHash));

    if (!selectedTx) {
      throw new Error('Tx doesn`t exist');
    }

    const decodeTransaction = decode_transaction(selectedTx.txBytes);

    return new TransactionByHashResponse({
      tx: this.mapTransaction(decodeTransaction),
    }).toBinary();
  }

  async getTransactions(request: object) {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    const decodeRequest = new TransactionsRequest().fromBinary(
      new Uint8Array(Object.values(request))
    );

    let data: Transaction[] = [];
    if (decodeRequest.startHeight && decodeRequest.endHeight) {
      data = tx.filter(
        (i) =>
          i.blockHeight >= decodeRequest.startHeight &&
          i.blockHeight <= decodeRequest.endHeight
      );
    } else if (decodeRequest.startHeight && !decodeRequest.endHeight) {
      data = tx.filter((i) => i.blockHeight >= decodeRequest.startHeight);
    } else {
      data = tx;
    }

    return data.map((i) => {
      return new TransactionsResponse({
        blockHeight: i.blockHeight,
        txHash: i.txHash,
        tx: this.mapTransaction(decode_transaction(i.txBytes)),
      }).toBinary();
    });
  }

  async getFMDParameters(request?: FMDParametersRequest) {
    const fmd: FmdParameters[] = await this.indexedDb.getAllValue(
      'fmd_parameters'
    );

    return new FMDParametersResponse({
      parameters: fmd[0],
    }).toBinary();
  }

  mapTransaction(decodeTransaction) {
    return {
      bindingSig: new TextEncoder().encode(decodeTransaction.binding_sig),
      anchor: {
        inner: new TextEncoder().encode(decodeTransaction.anchor),
      },
      body: {
        actions: decodeTransaction.body.actions.map((i) => {
          return {
            action: {
              case: Object.keys(i.action)[0].toLowerCase(),
              value: {
                authSig: {
                  inner: new TextEncoder().encode(
                    (Object.values(i.action)[0] as any).auth_sig
                  ),
                },
                proof: new TextEncoder().encode(
                  (Object.values(i.action)[0] as any).proof
                ),
                body: {
                  balanceCommitment: {
                    inner: new TextEncoder().encode(
                      (Object.values(i.action)[0] as any).body
                        .balance_commitment
                    ),
                  },
                  nullifier: new TextEncoder().encode(
                    (Object.values(i.action)[0] as any).body.nullifier
                  ),
                  rk: new TextEncoder().encode(
                    (Object.values(i.action)[0] as any).body.rk
                  ),
                  wrappedMemoKey: new TextEncoder().encode(
                    (Object.values(i.action)[0] as any).body.wrapped_memo_key
                  ),
                  ovkWrappedKey: new TextEncoder().encode(
                    (Object.values(i.action)[0] as any).body.ovk_wrapped_key
                  ),
                  notePayload: {
                    ephemeralKey: new TextEncoder().encode(
                      (Object.values(i.action)[0] as any).body.note_payload
                        ?.ephemeral_key
                    ),
                    encryptedNote: new TextEncoder().encode(
                      (Object.values(i.action)[0] as any).body.note_payload
                        ?.encrypted_note
                    ),
                    noteCommitment: {
                      inner: new TextEncoder().encode(
                        (Object.values(i.action)[0] as any).body.note_payload
                          ?.note_commitment
                      ),
                    },
                  },
                },
              },
            },
          };
        }),
        expiryHeight: BigInt(decodeTransaction.body.expiry_height),
        chainId: decodeTransaction.body.chain_id,
        fee: {
          assetId: {
            inner: new TextEncoder().encode(
              decodeTransaction.body.fee.asset_id
            ),
          },
          amount: {
            lo: BigInt(decodeTransaction.body.fee.amount.lo),
            hi: BigInt(decodeTransaction.body.fee.amount.hi),
          },
        },
        fmdClues: decodeTransaction.body.fmd_clues.map((i) => ({
          inner: new TextEncoder().encode(i),
        })),
        //TODO wtf
        // encryptedMemo: decodeTransaction.body.encrypted_memo,
      },
    };
  }
}
