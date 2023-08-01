import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { OutputPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import React, { useEffect, useMemo, useState } from 'react'
import Background from '../../services/Background'
import { ASSET_TABLE_NAME } from '../../../lib'
import { ActionCell } from '../ActionCell'
import { AddressView } from '../AddressView'
import { getHumanReadableValue } from '../../../utils'

export const OutputView: React.FC<{ view: OutputPlan }> = ({ view }) => {
	const [asset, setAsset] = useState<DenomMetadata | undefined>()

	useEffect(() => {
		const getAsset = async () => {
			const valueView = view.value
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
		const valueView = view.value
		const addressView = view.destAddress

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
		<ActionCell title='Output'>
			{assetHumanAmount} {asssetHumanDenom} to&nbsp;
			{addressView && <AddressView address={addressView} />}
		</ActionCell>
	)
}
