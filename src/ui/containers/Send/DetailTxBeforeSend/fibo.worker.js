//fibo.worker.js
// eslint-disable-next-line import/no-anonymous-default-export

import { penumbraWasm } from '../../../../utils/wrapperPenumbraWasm'

self.onmessage = message => {
	const req = message.data
	const buildTx = penumbraWasm.build_tx(
		req.spendingKey,
		req.fvk,
		req.sendPlan,
		req.loadStoredTree
	)

	const encodeTx = penumbraWasm.encode_tx(buildTx)

	postMessage(encodeTx)
}

// export {}
