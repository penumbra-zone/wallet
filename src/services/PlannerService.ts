import { ViewProtocolService } from './ViewProtocolService'
import { TransactionPlanner } from './TransactionPlanner'
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'

export class PlannerService {
	private planner: TransactionPlanner

	constructor({
		transactionPlanner,
	}: {
		transactionPlanner: TransactionPlanner
	}) {
		this.planner = transactionPlanner
	}

	async plan(plannerRequest: any): Promise<TransactionPlan> {
		return this.planner.plan()
	}
}
