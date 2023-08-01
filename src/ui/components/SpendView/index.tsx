import { SpendPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import React, { useEffect, useMemo, useState } from 'react'
import { ActionCell } from '../ActionCell'
import Background from '../../services/Background'
import { ASSET_TABLE_NAME } from '../../../lib'
import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { AddressView } from '../AddressView'
import { getHumanReadableValue } from '../../../utils'

export const SpendView: React.FC<{ view: SpendPlan }> = ({ view }) => {
	const [asset, setAsset] = useState<DenomMetadata | undefined>()

	useEffect(() => {
		const getAsset = async () => {
			const valueView = view.note.value
			const assetId = valueView.assetId.toJson() as { inner: string }
			const asset = (await Background.getValueById(
				ASSET_TABLE_NAME,
				assetId.inner
			)) as DenomMetadata

			setAsset(asset)
		}
		getAsset()
	}, [view])

	const { assetHumanAmount, asssetHumanDenom, addressView } = useMemo(() => {
		if (!asset)
			return {
				assetHumanAmount: '',
				asssetHumanDenom: '',
			}
		const valueView = view.note.value
		const addressView = view.note.address

		const assetAmount = valueView.amount
		const { assetHumanAmount, asssetHumanDenom } = getHumanReadableValue(
			asset,
			assetAmount
		)

		return {
			assetHumanAmount,
			asssetHumanDenom,
			addressView,
		}
	}, [view, asset])

	return (
		<ActionCell title='Spend'>
			{assetHumanAmount} {asssetHumanDenom} from&nbsp;
			{addressView && <AddressView address={addressView} />}
		</ActionCell>
	)
}
