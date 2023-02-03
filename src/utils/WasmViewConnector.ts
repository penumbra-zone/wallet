import {decode_nct_root, ViewClient} from "penumbra-web-assembly";
import snakeize from 'snakeize'
import {SpendableNoteRecord, SwapRecord} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb";
import {
    CompactBlock,
    FmdParameters
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb";
import {
    ObliviousQueryService,
    SpecificQueryService
} from "@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb";
import {
    CompactBlockRangeRequest,
    KeyValueRequest
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb";
import {
    createPromiseClient,
} from '@bufbuild/connect-web';
import {base64encode} from "./base64";

export type StoredTree = {
    last_position: number;
    last_forgotten: number;
    hashes: StoredHash[]
    commitments: StoredCommitment[];
};

export type StoredHash = {
    position: number;
    height: number;
    hash: Uint8Array;
};

export type StoredCommitment = {
    position: number;
    commitment: Uint8Array;
};

export type ScanResult = {
    height;
    nct_updates: NctUpdates;
    new_notes: SpendableNoteRecord[];
    new_swaps: SwapRecord[];
}

export type NctUpdates = {
    delete_ranges: [];
    set_forgotten;
    set_position;
    store_commitments: [];
    store_hashes: [];

}


export class WasmViewConnector {
    private indexedDb;

    private viewClient;

    constructor({
                    indexedDb
                }) {
        this.indexedDb = indexedDb;

    }

    async handleNewCompactBlock(block: CompactBlock, fvk,transport )  {

        console.debug("new block", block)
        if (this.viewClient == undefined) {
            let storedTree = await this.loadStoredTree();
            this.viewClient = new ViewClient(fvk, 719n, storedTree);
        }
        await this.viewClient.scan_block_without_updates(block.toJson());


        if (block.nullifiers.length > 0) {
            for (const nullifier of block.nullifiers) {
                await this.indexedDb.updateNotes(nullifier, block.height)
            }
        }
        if (block.fmdParameters !== undefined)
            await this.saveFmdParameters(block.fmdParameters)

        // let ntcRoot = this.viewClient.get_nct_root();
        //
        // const client = createPromiseClient(SpecificQueryService, transport);
        //
        // const keyValueRequest : KeyValueRequest = new KeyValueRequest();
        // keyValueRequest.key = "shielded_pool/anchor/" + block.height
        // let keyValue = await client.keyValue(keyValueRequest);
        //
        // let decodeNctRoot = decode_nct_root(this.toHexString(keyValue.value));
        //
        // // if (decodeNctRoot.inner != decodeNctRoot.inner ) {
        //     console.log(block)
        //     console.log("Nct root ", ntcRoot)
        //     console.log("expected root",decodeNctRoot)
        // // }
        //
        // const delay = ms => new Promise(res => setTimeout(res, ms));
        //



    }




    public async loadStoredTree(): Promise<StoredTree> {

        const nctPosition = await this.indexedDb.getValue(
            'nct_position', "position"
        );

        const nctForgotten = await this.indexedDb.getValue(
            'nct_forgotten', "forgotten"
        );

        const nctHashes: StoredHash[] = await this.indexedDb.getAllValue(
            'nct_hashes'
        );

        const nctCommitments: StoredCommitment[] = await this.indexedDb.getAllValue(
            'nct_commitments'
        );

        return {
            commitments: nctCommitments, hashes: nctHashes,
            last_forgotten: nctForgotten,
            last_position: nctPosition
        };

    }

    public async loadUpdates() {
        if (this.viewClient == undefined) {
            console.error("View client is undefined")
        } else {
            let storedTree = await this.loadStoredTree();
            let updates = await this.viewClient.get_updates(storedTree.last_position, storedTree.last_forgotten);
            await this.handleScanResult(updates)
        }
    }

    async handleScanResult(scanResult: ScanResult) {

        if (scanResult.nct_updates !== undefined) {
            if (scanResult.nct_updates.set_forgotten !== undefined) {
                await this.updateForgotten(scanResult.nct_updates.set_forgotten);
            }
            if (scanResult.nct_updates.set_position !== undefined) {
                await this.updatePosition(scanResult.nct_updates.set_position);
            }
            for (const commitment of scanResult.nct_updates.store_commitments) {
                await this.storeCommitment(commitment);
            }
            for (const hash of scanResult.nct_updates.store_hashes) {
                await this.storeHash(hash);
            }
            if (scanResult.nct_updates.delete_ranges.length > 0) {
            }
        }

        if (scanResult.new_notes.length > 0 || scanResult.new_swaps.length > 0)
            // console.log("New notes or swaps", scanResult)

        for (const note of scanResult.new_notes) {
            await this.storeNote(note);
        }

        for (const swap of scanResult.new_swaps) {
            await this.storeSwap(swap);
        }
    }

    async updateForgotten(setForgotten) {
        await this.indexedDb.putValueWithId('nct_forgotten', setForgotten, "forgotten");
    }

    async updatePosition(setPosition) {
        await this.indexedDb.putValueWithId('nct_position', setPosition, "position");

    }

    async storeCommitment(commitment) {
        await this.indexedDb.putValue('nct_commitments', commitment);
    }

    async storeHash(hash) {
        await this.indexedDb.putValue('nct_hashes', hash);
    }

    async storeNote(note) {
        let storedNote = await this.indexedDb.getValue("spendable_notes", note.noteCommitment.inner);
        if (storedNote == undefined)
            await this.indexedDb.putValueWithId('spendable_notes', note, note.noteCommitment.inner);
        else
            console.debug("note already stored", note.noteCommitment.inner)
    }

    async storeSwap(swap) {
        let storedSwap = await this.indexedDb.getValue("swaps", swap.swapCommitment.inner);
        if (storedSwap == undefined)
            await this.indexedDb.putValueWithId('swaps', swap, swap.swapCommitment.inner);
        else
            console.debug("swap already stored", swap.swapCommitment.inner)
    }

    async saveFmdParameters(fmdParameters: FmdParameters) {
        await this.indexedDb.putValueWithId('fmd_parameters', fmdParameters, "fmd");
    }


    convertCompactBlock(block: CompactBlock): CompactBlock {

        // let transparentInner = this.transparentInner(block)
        let convertedBlock = this.convertByteArraysToHex(block);

        return this.fixCaseField(convertedBlock);
    }

    fixCaseField(o) {
        for (let prop in o) {
            if (Array.isArray(o[prop])) {

                for (const element of o[prop]) {
                    this.fixCaseField(element);
                }
            } else {
                if (typeof (o[prop]) === 'object') {

                    this.fixCaseField(o[prop]);
                } else {
                    if (prop === "case") {
                        o[prop] = this.capitalizeFirstLetter(o[prop])
                    }
                }
            }
        }
        return o;
    }


    convertByteArraysToHex(o) {
        for (var prop in o) {

            if (Array.isArray(o[prop])) {

                for (const element of o[prop]) {
                    this.convertByteArraysToHex(element);
                }
            } else {
                if (typeof (o[prop]) === 'object' && !(o[prop] instanceof Uint8Array)) {
                    this.convertByteArraysToHex(o[prop]);
                } else {
                    if (o[prop] instanceof Uint8Array) {
                        o[prop] = this.toHexString(o[prop])
                    }
                }
            }
        }
        return o;
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    toHexString(bytes: any) {
        return bytes.reduce(
            (str: any, byte: any) => str + byte.toString(16).padStart(2, '0'),
            ''
        );
    }


}