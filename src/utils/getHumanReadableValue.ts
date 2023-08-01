import {
	Amount,
	DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { calculateAmount } from './calculateAmount'

// Value - Amount + AssetId
export const getHumanReadableValue = (
	asset: DenomMetadata | undefined,
	amount: Amount | undefined
): {
	assetHumanAmount: number
	asssetHumanDenom: string
} => {
	let assetExponent
	let asssetHumanDenom: string
	// if (!asset) {
	// 	assetExponent = 0
	// 	asssetHumanDenom = bech32m.encode(
	// 		UNKNOWN_ASSET_PREFIX,
	// 		bech32m.toWords(assetId.inner)
	// 	)
	// } else {

	asssetHumanDenom = asset?.display!
	assetExponent =
		asset?.denomUnits.find(i => i.denom === asssetHumanDenom)?.exponent || 0
	// }

	const assetHumanAmount = amount
		? calculateAmount(Number(amount?.lo), Number(amount?.hi), assetExponent)
		: 0

	return {
		assetHumanAmount,
		asssetHumanDenom,
	}
}
