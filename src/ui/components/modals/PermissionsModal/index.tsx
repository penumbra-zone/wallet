import { ChangeEvent, useEffect, useState } from 'react'
import { PermissionType } from '../../../../controllers'
import Background from '../../../services/Background'
import { ModalWrapper } from '../../ModalWrapper'
import { Tabs } from '../../Tabs'
import { Toogle } from '../../Toogle'
import { SuccessCreateModalProps } from '../SuccessCreateModal'

const lowPermissions = {
	getChainCurrentStatus: 'Get current status of chain',
	getNotes: 'Get notes',
	getQuarantinedNotes: 'Get notes that have been quarantined',
	getWitness: 'Get witness',
	getAssets: 'Get assets',
	getChainParameters: 'Get chain parameters',
	getFmdParameters: 'Get FMD parameters',
	getNoteByCommitment: 'Get note by note commitment',
	getNullifierStatus: 'Get nullifier status',
	getTransactionInfo: 'Get transactions',
	getTransactionPerspective: 'Get transactions perspective',
}

export const PermissionsModal: React.FC<
	SuccessCreateModalProps & {
		permissions: PermissionType[]
		selectedSite: string
	}
> = ({ show, permissions, selectedSite, onClose }) => {
	const [currentPermissions, setCurrentPermissions] = useState<{
		[key: string]: boolean
	}>({})

	useEffect(() => {
		const obj = {}
		Object.keys(lowPermissions).forEach((i: PermissionType) => {
			obj[i] = permissions.includes(i)
		})
		setCurrentPermissions(obj)
	}, [permissions])

	const handleChange =
		(type: PermissionType) => async (e: ChangeEvent<HTMLInputElement>) => {
			e.target.checked
				? await Background.setPermission(selectedSite, type)
				: await Background.deletePermission(selectedSite, type)
		}

	return (
		<ModalWrapper
			show={show}
			onClose={onClose}
			position='center'
			className='pt-[24px] pb-[42px] px-[0px] w-[320px] h-[400px] overflow-y-auto'
		>
			<div className='flex flex-col px-[16px]'>
				<Tabs
					tabs={['Low', 'High']}
					className='text_button_ext bg-brown'
					children={type =>
						type === 'Low' ? (
							<>
								{Object.keys(lowPermissions).map((i: PermissionType) => {
									return (
										<div
											key={i}
											className='flex items-center justify-between pb-[6px] pt-[22px] border-b-[1px] border-solid border-dark_grey'
										>
											<p className='h2_ext mr-[32px]'>{lowPermissions[i]}</p>
											<Toogle
												checked={currentPermissions[i]}
												handleChange={handleChange(i)}
											/>
										</div>
									)
								})}
							</>
						) : (
							<></>
						)
					}
				/>
			</div>
		</ModalWrapper>
	)
}
