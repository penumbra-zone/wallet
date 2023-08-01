import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb'
import { bech32m } from 'bech32'
import React from 'react'

export const AddressView: React.FC<{ address: Address }> = ({ address }) => {
	const prefix = 'penumbrav2t'
	const fullAddress = address.altBech32m
		? address.altBech32m
		: bech32m.encode(prefix, bech32m.toWords(address.inner), 160)
	const shortAddress = fullAddress.slice(0, prefix.length + 1 + 24) + '…'

	return <span>{shortAddress}</span>
}
