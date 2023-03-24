import { useState } from 'react'
import { useMediaQuery } from '../../../hooks'
import { Button, ExportSeedPhraseModal } from '../../components'

export const SettingsSecurityPrivacy = () => {
	const isDesktop = useMediaQuery()
	const [isOpenSeedModal, setIsOpenSeedModal] = useState<boolean>(false)

	const toggleShowSeedModal = (value: boolean) => () =>
		setIsOpenSeedModal(value)

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
					</div>
				</div>
			</div>
			<ExportSeedPhraseModal
				show={isOpenSeedModal}
				onClose={toggleShowSeedModal(false)}
			/>
		</>
	)
}
