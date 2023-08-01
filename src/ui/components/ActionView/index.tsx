import { ActionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import React from 'react'
import { SpendView } from '../SpendView'
import { OutputView } from '../OutputView'
import { SwapView } from '../SwapView'

export const ActionView: React.FC<{ action: ActionPlan }> = ({ action }) => {
	switch (action.action.case) {
		case 'spend':
			return <SpendView view={action.action.value} />
		case 'output':
			return <OutputView view={action.action.value} />
		case 'swap':
			return <SwapView view={action.action.value} />
		default:
			return <></>
	}
}
