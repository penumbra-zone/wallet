import { DenomMetadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { SwapPlaintext } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/dex/v1alpha1/dex_pb'
import React, { useEffect, useMemo, useState } from 'react'
import { ASSET_TABLE_NAME } from '../../../lib'
import Background from '../../services/Background'
import { ActionCell } from '../ActionCell'
import { getHumanReadableValue } from '../../../utils'

export const SwapView: React.FC<{
	swapPlaintext: SwapPlaintext
	title: string
}> = ({ swapPlaintext, title }) => {
	const [asset1, setAsset1] = useState<DenomMetadata | undefined>()
	const [asset2, setAsset2] = useState<DenomMetadata | undefined>()
	useEffect(() => {
		const getAsset = async () => {
			const tradingPair = swapPlaintext.tradingPair

			const asset1Id = tradingPair.asset1.toJson() as { inner: string }
			const asset1 = (await Background.getValueById(
				ASSET_TABLE_NAME,
				asset1Id.inner
			)) as DenomMetadata

			setAsset1(asset1)

			const asset2Id = tradingPair.asset2.toJson() as { inner: string }
			const asset2 = (await Background.getValueById(
				ASSET_TABLE_NAME,
				asset2Id.inner
			)) as DenomMetadata

			setAsset2(asset2)
		}
		getAsset()
	}, [swapPlaintext])

	const {
		asset1HumanAmount,
		assset1HumanDenom,
		asset2HumanAmount,
		assset2HumanDenom,
		feeHumanAmount,
		feeHumanDenom,
	} = useMemo(() => {
		if (!asset1 || !asset2)
			return {
				asset1HumanAmount: '',
				assset1HumanDenom: '',
				asset2HumanAmount: '',
				assset2HumanDenom: '',
				feeHumanAmount: '',
				feeHumanDenom: '',
			}

		const asset1Amount = swapPlaintext?.delta1I
		const {
			assetHumanAmount: asset1HumanAmount,
			asssetHumanDenom: assset1HumanDenom,
		} = getHumanReadableValue(asset1, asset1Amount)

		const asset2Amount = swapPlaintext?.delta2I
		const {
			assetHumanAmount: asset2HumanAmount,
			asssetHumanDenom: assset2HumanDenom,
		} = getHumanReadableValue(asset2, asset2Amount)

		// TODO: SwapPlan.swapPlaintext?.claimFee should include assetId
		const feeAmount = swapPlaintext.claimFee.amount
		const {
			assetHumanAmount: feeHumanAmount,
			asssetHumanDenom: feeHumanDenom,
		} = getHumanReadableValue(asset2, feeAmount)

		return {
			asset1HumanAmount,
			assset1HumanDenom,
			asset2HumanAmount,
			assset2HumanDenom,
			feeHumanAmount,
			feeHumanDenom,
		}
	}, [swapPlaintext, asset1, asset2])

	return (
		<ActionCell title={title}>
			{asset1HumanAmount
				? `${asset1HumanAmount} ${assset1HumanDenom} for ${assset2HumanDenom} and paid claim fee ${feeHumanAmount} ${feeHumanDenom}`
				: `${asset2HumanAmount} ${assset2HumanDenom} for ${assset1HumanDenom} and paid claim fee ${feeHumanAmount} ${feeHumanDenom}`}
		</ActionCell>
	)
}
