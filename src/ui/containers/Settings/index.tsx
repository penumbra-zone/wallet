import { Outlet } from 'react-router-dom'
import { SettingSideBar } from '../../components'

export const Settings = () => {
	return (
		<div className='w-[100%] h-[auto] flex justify-center mt-[18px]'>
			<div className='w-[100%] flex flex-col bg-brown rounded-[15px]'>
				<div className='flex pt-[16px] pb-[24px] border-b-[1px] border-solid border-dark_grey'>
					<p className='h1 pl-[20px]'>Settings</p>
				</div>
				<div className='flex h-[100%]'>
					<SettingSideBar />
					{/* <div className="w-[610px]"> */}
					<div className='w-[100%]'>
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	)
}
