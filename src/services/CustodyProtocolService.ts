import {ExtensionStorage} from "../storage";
import {
    AuthorizationData,
    TransactionPlan
} from "@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/transaction/v1alpha1/transaction_pb";
import {sign_plan} from "penumbra-web-assembly";
import {WalletController} from "../controllers";
import {randomBytes, randomInt} from "crypto";

export class CustodyProtocolService {

    private getAccountSpendingKey;

    constructor({
                    getAccountSpendingKey,
                }: {
        getAccountSpendingKey: WalletController['getAccountSpendingKeyWithoutPassword'];
    }) {
    }

    async authorize(plan: TransactionPlan) {
        let authorizationData: AuthorizationData = sign_plan(this.getAccountSpendingKey(), plan);

        return authorizationData;
    }

    async broadcastTx(tx_bytes_hex: string) {

        const broadcastResponse = await fetch('${tendermint}', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "method": "broadcast_tx_sync",
                "params": [tx_bytes_hex],
                "id": randomInt(Number.MAX_SAFE_INTEGER),
            })
        });
        const content = await broadcastResponse.json();

        return content;

    }

}