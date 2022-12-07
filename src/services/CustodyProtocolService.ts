import {ExtensionStorage} from "../storage";
import {
    AuthorizationData,
    TransactionPlan
} from "@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/transaction/v1alpha1/transaction_pb";
import {sign_plan} from "penumbra-web-assembly";
import {WalletController} from "../controllers";

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

}