import {
  ChainParameters,
  FmdParameters,
  NoteSource,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/chain/v1alpha1/chain_pb';
import { ClientController, Transaction } from '../controllers';
import { ExtensionStorage } from '../storage';
import { EncodeAsset } from '../types';
import { bytesToString, IndexedDb, stringToBytes } from '../utils';
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
  SpendableNoteRecord,
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
  Address,
  AddressIndex,
  Amount,
  Asset,
  AssetId,
  Denom,
  Note,
  Nullifier,
  StateCommitment,
  Value,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/crypto/v1alpha1/crypto_pb';
import {
  ChainParametersRequest,
  ChainParametersResponse,
} from '@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/client/v1alpha1/client_pb';

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

  async getAssets(request: AssetsRequest): Promise<AssetsResponse[]> {
    const assets: EncodeAsset[] = await this.indexedDb.getAllValue('assets');

    console.log(
      assets.map((i) => {
        return {
          asset: {
            id: { inner: stringToBytes(i.id) },
            denom: { denom: i.denom },
          },
        } as AssetsResponse;
      })
    );

    return assets.map((i) => {
      return {
        asset: {
          id: { inner: stringToBytes(i.id) },
          denom: { denom: i.denom },
        },
      } as AssetsResponse;
    });
  }

  async getChainParameters(
    request?: ChainParametersRequest
  ): Promise<ChainParametersResponse> {
    const chainParameters: ChainParameters[] = await this.indexedDb.getAllValue(
      'chainParameters'
    );

    return {
      chainParameters: new ChainParameters(chainParameters[0]),
    } as ChainParametersResponse;
  }

  async getNotes(request?: NotesRequest): Promise<NotesResponse[]> {
    const notes = await this.indexedDb.getAllValue('notes');

    const mapData = notes.map((i) => ({
      note_commitment: i.note_commitment,
      note: {
        value: i.value,
        note_blinding: i.note_blinding,
        address: i.address,
      },
      address_index: 0,
      nullifier: i.nullifier,
      height_created: i.height,
      //TODO add height_spent and position
      height_spent: undefined,
      position: undefined,
      source: i.source,
    }));

    console.log(
      mapData.map((i) => {
        return {
          noteRecord: {
            noteCommitment: { inner: stringToBytes(i.note_commitment) },
            note: {
              value: {
                amount: {
                  lo: i.note.value.amount.lo,
                  hi: i.note.value.amount.hi,
                },
                assetId: {
                  inner: stringToBytes(i.note.value.asset_id),
                },
              },
              noteBlinding: stringToBytes(i.note_blinding),
              address: { inner: stringToBytes(i.address) },
            },
            addressIndex: {
              inner: stringToBytes('0'),
            },
            nullifier: {
              inner: stringToBytes(i.nullifier[0]),
            },
            heightCreated: i.height as any,
            // heightSpent,
            // position
            source: { inner: stringToBytes(i.source) },
          },
        };
      })
    );

    return mapData.map((i) => {
      return {
        noteRecord: {
          noteCommitment: { inner: stringToBytes(i.note_commitment) },
          note: {
            value: {
              amount: {
                lo: i.note.value.amount.lo,
                hi: i.note.value.amount.hi,
              },
              assetId: {
                inner: stringToBytes(i.note.value.asset_id),
              },
            },
            noteBlinding: stringToBytes(i.note_blinding),
            address: { inner: stringToBytes(i.address) },
          },
          addressIndex: {
            inner: stringToBytes('0'),
          },
          nullifier: {
            inner: stringToBytes(i.nullifier[0]),
          },
          heightCreated: i.height as any,
          // heightSpent,
          // position
          source: { inner: stringToBytes(i.source) },
        },
      };
    });
  }

  async getNoteByCommitment(
    request: NoteByCommitmentRequest
  ): Promise<NoteByCommitmentResponse> {
    const notes: NotesResponse[] = await this.getNotes();

    const selectedNote = notes.find(
      (n) =>
        bytesToString(n.noteRecord.noteCommitment.inner) ===
        bytesToString(request.noteCommitment.inner)
    );

    if (!selectedNote) {
      throw new Error('Note doesn`t exist');
    }

    return {
      spendableNote: selectedNote.noteRecord,
    } as NoteByCommitmentResponse;
  }

  async getStatus(request: StatusRequest): Promise<StatusResponse> {
    const { lastSavedBlock } = await this.extensionStorage.getState(
      'lastSavedBlock'
    );
    const lasBlock = await this.getLastExistBlock();

    return {
      syncHeight: lastSavedBlock.testnet,
      catchingUp: lastSavedBlock.testnet === lasBlock,
    } as StatusResponse;
  }

  async getTransactionHashes(
    request: TransactionHashesRequest
  ): Promise<TransactionHashesResponse[]> {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    let data: Transaction[] = [];

    if (request?.startHeight && request?.endHeight) {
      data = tx.filter(
        (i) =>
          i.block_height >= request.startHeight &&
          i.block_height <= request.endHeight
      );
    } else if (request?.startHeight && !request?.endHeight) {
      data = tx.filter((i) => i.block_height >= request.startHeight);
    } else {
      data = tx;
    }

    return data.map((i) => {
      return {
        blockHeight: i.block_height as any,
        txHash: stringToBytes(i.tx_hash),
      } as TransactionHashesResponse;
    });
  }

  async getTransactionByHash(
    request: TransactionByHashRequest
  ): Promise<TransactionByHashResponse> {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    const selectedTx = tx.find(
      (t) => t.tx_hash === bytesToString(request.txHash)
    );
    if (!selectedTx) {
      throw new Error('Tx doesn`t exist');
    }

    return decode_transaction(selectedTx.tx_bytes);
  }

  async getTransactions(
    request?: TransactionsRequest
  ): Promise<TransactionsResponse[]> {
    const tx: Transaction[] = await this.indexedDb.getAllValue('tx');
    let data: Transaction[] = [];
    if (request?.startHeight && request?.endHeight) {
      data = tx.filter(
        (i) =>
          i.block_height >= request.startHeight &&
          i.block_height <= request.endHeight
      );
    } else if (request?.startHeight && !request?.endHeight) {
      data = tx.filter((i) => i.block_height >= request.startHeight);
    } else {
      data = tx;
    }

    return data.map((i) => {
      return {
        blockHeight: i.block_height as any,
        txHash: stringToBytes(i.tx_hash),
        tx: decode_transaction(i.tx_bytes),
      } as TransactionsResponse;
    });
  }

  async getFMDParameters(
    request: FMDParametersRequest
  ): Promise<FMDParametersResponse> {
    const fmd: FmdParameters[] = await this.indexedDb.getAllValue(
      'fmd_parameters'
    );

    return {
      parameters: fmd[0],
    } as FMDParametersResponse;
  }
}
