import { Outlet, useNavigate } from 'react-router-dom'
import { Button, ChevronLeftIcon, SettingSideBar } from '../../components'
import { routesPath } from '../../../utils'

export const Settings = () => {
	const navigate = useNavigate()
	const handleBack = () => navigate(routesPath.HOME)

	return (
		<div className='w-[100%] h-[auto] flex flex-col justify-center mt-[26px]'>
			<div className='self-start mb-[26px]'>
				<Button
					mode='icon_transparent'
					onClick={handleBack}
					title='Back'
					iconLeft={<ChevronLeftIcon stroke='#E0E0E0' />}
				/>
			</div>
			<div className='flex h-[100%] w-[100%]  bg-brown rounded-[10px]'>
				<SettingSideBar />
				<div className='w-[100%]'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}
