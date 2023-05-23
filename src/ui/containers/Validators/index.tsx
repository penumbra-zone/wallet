import { ValidatorInfoRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/client/v1alpha1/client_pb'
import { ValidatorInfo } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/stake/v1alpha1/stake_pb'
import { createPromiseClient } from '@bufbuild/connect'
import { createGrpcWebTransport } from '@bufbuild/connect-web'
import { useEffect, useState } from 'react'
import { useAccountsSelector } from '../../../account'
import { Balance, Button, Tabs } from '../../components'
import { selectNetworks } from '../../redux'
import { AllValidators } from '../AllValidators'
import { MyValidators } from '../MyValidators'
;
import {
	ObliviousQueryService
} from "@buf/penumbra-zone_penumbra.bufbuild_connect-es/penumbra/client/v1alpha1/client_connect";

('@buf/penumbra-zone_penumbra.bufbuild_connect-web/penumbra/client/v1alpha1/client_connectweb')

export const Validators = () => {
	const networks = useAccountsSelector(selectNetworks)
	const [validators, setValidators] = useState<ValidatorInfo[]>([])

	const getValidators = async () => {
		const transport = createGrpcWebTransport({
			baseUrl: networks[0].grpc,
		})
		const client = createPromiseClient(ObliviousQueryService, transport)

		const validatorInfoRequest = new ValidatorInfoRequest()
		validatorInfoRequest.chainId = networks[0].chainId
		validatorInfoRequest.showInactive = true

		try {
			for await (const response of client.validatorInfo(validatorInfoRequest)) {
				setValidators(state => [...state, response.validatorInfo])
			}
		} catch (error) {}
	}

	useEffect(() => {
		getValidators()
	}, [])

	return (
		<div className='w-[100%] mt-[20px] mb-[20px]'>
			<div className='mx-[0px] flex flex-col items-center'>
				<div className='w-[100%] flex items-center justify-between rounded-[15px] bg-brown py-[24px] px-[20px] mb-[24px]'>
					<div className='flex flex-col'>
						<p className='h3 mb-[16px]'>Total PNB Amount </p>
						<Balance className='text_numbers pb-[4px]' />
						<div className='flex text_numbers_s'>
							<p>~ $ -</p>
							<p className='text-green mx-[4px]'>(0%)</p>
							<p>24h</p>
						</div>
					</div>
					<div className='flex'>
						<Button
							mode='transparent'
							title='Send'
							className='w-[110px] tablet:py-[9px]'
						/>
						<Button
							mode='gradient'
							title='Deposit'
							className='w-[110px] ml-[16px] tablet:py-[9px]'
						/>
					</div>
				</div>
				<div className='w-[100%] flex items-center justify-between rounded-[15px] bg-brown py-[24px] px-[20px] mb-[40px]'>
					<div className='flex flex-col'>
						<p className='h3 mb-[8px]'>Staked Amount</p>
						<p className='text_numbers mb-[4px]'>0 PNB</p>
						<p className='text_numbers_s'>~ $ -</p>
					</div>
					<div className='flex flex-col border-l-[1px] border-solid border-light_brown pl-[24px]'>
						<p className='h3 mb-[8px]'>Available Balance</p>
						<Balance className='text_numbers pb-[4px]' />
						<p className='text_numbers_s'>~ $ -</p>
					</div>
					<div className='flex flex-col border-l-[1px] border-solid border-light_brown pl-[24px]'>
						<p className='h3 mb-[8px]'>Claimable Rewards</p>
						<p className='text_numbers mb-[14px] '>~ $ -</p>
					</div>
					<Button
						mode='gradient'
						title='Claim'
						className='w-[110px] ml-[16px] tablet:py-[9px]'
					/>
				</div>
			</div>
			<Tabs
				tabs={['All Penumbra Validators', 'My Validators']}
				className='bg-[#000000]'
				children={type =>
					type === 'All Penumbra Validators' ? (
						<AllValidators validators={validators} />
					) : (
						<MyValidators />
					)
				}
			></Tabs>
		</div>
	)
}
