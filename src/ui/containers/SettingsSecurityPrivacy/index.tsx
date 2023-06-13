import { useState } from 'react'
import { useMediaQuery } from '../../../hooks'
import { Button, ExportKeyModal, ExportSeedPhraseModal } from '../../components'

export type KeysModalType = '' | 'full_viewing_key' | 'spending_key'

export const SettingsSecurityPrivacy = () => {
	const isDesktop = useMediaQuery()
	const [isOpenSeedModal, setIsOpenSeedModal] = useState<boolean>(false)
	const [keyModalType, setKeyModalType] = useState<KeysModalType>('')

	const toggleShowSeedModal = (value: boolean) => () =>
		setIsOpenSeedModal(value)

	const changeKeyModalType = (type: KeysModalType) => () => {
		setKeyModalType(type)
	}

	return (
		<>
			<div>
				<p
					className={`w-[100%] px-[16px] py-[24px] border-b-[1px] border-solid border-dark_grey ${
						isDesktop ? 'h2' : 'h1_ext'
					}`}
				>
					Security and Privacy
				</p>
				<div className='tablet:px-[16px] h-[100%] mt-[24px]'>
					<div className='w-[100%] flex flex-col ext:px-[16px] tablet:px-[0px]'>
						<div className='flex flex-col mb-[24px]'>
							<p className='h3 mb-[16px]'>Show recovery passphrase</p>
							<Button
								title='Show passphrase'
								mode='gradient'
								onClick={toggleShowSeedModal(true)}
								className='ext:w-[100%] tablet:w-[280px]'
							/>
						</div>
						<div className='flex flex-col mb-[24px]'>
							<p className='h3 mb-[16px]'>Full viewing key</p>
							<Button
								title='Export full viewing key'
								mode='gradient'
								onClick={changeKeyModalType('full_viewing_key')}
								className='ext:w-[100%] tablet:w-[280px]'
							/>
						</div>
						<div className='flex flex-col mb-[24px]'>
							<p className='h3 mb-[16px]'>Spending key</p>
							<Button
								title='Export spending key'
								mode='gradient'
								onClick={changeKeyModalType('spending_key')}
								className='ext:w-[100%] tablet:w-[280px]'
							/>
						</div>
					</div>
				</div>
			</div>
			<ExportSeedPhraseModal
				show={isOpenSeedModal}
				onClose={toggleShowSeedModal(false)}
			/>
			<ExportKeyModal
				type={keyModalType}
				show={Boolean(keyModalType)}
				onClose={changeKeyModalType('')}
			/>
		</>
	)
}
