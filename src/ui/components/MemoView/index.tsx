import { MemoPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb'
import { bech32m } from 'bech32'
import React, { useMemo } from 'react'
import { ActionCell } from '../ActionCell'
import { AddressView } from '../AddressView'

type MemoViewProps = { memoView: MemoPlan }

export const MemoView: React.FC<MemoViewProps> = ({ memoView }) => {
	const { memoText, memoSender, memoReturnAddress } = useMemo(() => {
		let memoText = 'Encrypted'
		let memoSender = 'Encrypted'
		let memoReturnAddress
		const plaintext = memoView.plaintext
		memoText = plaintext.text
		memoSender = bech32m.encode(
			'penumbrav2t',
			bech32m.toWords(plaintext.sender.inner),
			160
		)
		memoReturnAddress = plaintext.sender

		return {
			memoText,
			memoSender,
			memoReturnAddress,
		}
	}, [memoView])

	return (
		<div className='flex flex-col gap-y-[16px]'>
			{memoText && (
				<ActionCell
					title={memoText === 'Encrypted' ? 'Sender Address' : 'Message'}
					isEncrypted={memoText === 'Encrypted'}
				>
					{memoText}
				</ActionCell>
			)}
			<ActionCell
				title='Return Address'
				isEncrypted={memoSender === 'Encrypted'}
			>
				<AddressView address={memoReturnAddress!} />
			</ActionCell>
		</div>
	)
}
