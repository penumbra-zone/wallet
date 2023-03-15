import { ViewProtocolService } from './ViewProtocolService'
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'

export class TransactionPlanner {
	private viewService: ViewProtocolService

	constructor({ viewService }: { viewService: ViewProtocolService }) {
		this.viewService = viewService
	}

	async plan(): Promise<TransactionPlan> {
		let chainParameters = await this.viewService.getChainParameters()
		let transactionPlan = new TransactionPlan()
		transactionPlan.chainId = chainParameters.parameters.chainId
		return
	}
}
