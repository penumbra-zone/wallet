import { ViewProtocolService } from './ViewProtocolService'
import { ChainParametersResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'
import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'

export class TransactionPlanner {
	private viewService: ViewProtocolService

	constructor({ viewService }: { viewService: ViewProtocolService }) {
		this.viewService = viewService
	}

	async plan(): Promise<TransactionPlan> {
		let chainParametersBytes = await this.viewService.getChainParameters()

		const chainParameters = new ChainParametersResponse().fromBinary(
			chainParametersBytes
		)

		let transactionPlan = new TransactionPlan()
		transactionPlan.chainId = chainParameters.parameters.chainId

		return
	}
}
