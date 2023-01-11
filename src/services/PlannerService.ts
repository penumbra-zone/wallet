import {ViewProtocolService} from "./ViewProtocolService";
import {
    TransactionPlan
} from "@buf/bufbuild_connect-web_penumbra-zone_penumbra/penumbra/core/transaction/v1alpha1/transaction_pb";
import {TransactionPlanner} from "./TransactionPlanner";

export class PlannerService {

    private planner: TransactionPlanner;


    constructor({ transactionPlanner }: { transactionPlanner: TransactionPlanner }) {
        this.planner = transactionPlanner;
    }



    async plan(plannerRequest: any) : Promise<TransactionPlan> {
        return this.planner.plan();

    }
}