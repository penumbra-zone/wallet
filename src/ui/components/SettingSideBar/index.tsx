import { Link, useLocation } from 'react-router-dom'
import { routesPath } from '../../../utils'
import {
	AdditionallySvg,
	BellSvg,
	ContactsSvg,
	InformationOutlineSvg,
	LockSvg,
	PermissionsSvg,
	PlugSvg,
	SettingsSvg,
} from '../Svg'
import { Button } from '../Button'
import Background from '../../services/Background'

export const links = [
	// {
	//   to: routesPath.SETTINGS,
	//   svg: <SettingsSvg />,
	//   text: 'Support',
	// },
	{
		to: routesPath.SETTINGS,
		svg: <AdditionallySvg fill='#E0E0E0' />,
		text: 'Advanced',
	},
	{
		to: routesPath.SETTINGS_CONTACTS,
		// to: routesPath.SETTINGS_CONTACTS,
		svg: <ContactsSvg fill='#E0E0E0' />,
		text: 'Contacts',
	},
	{
		to: routesPath.SETTINGS_SECURITY_PRIVACY,
		svg: <LockSvg fill='#E0E0E0' />,
		text: 'Security and Privacy',
	},
	// {
	//   to: routesPath.SETTINGS_WARNINGS,
	//   svg: <BellSvg />,
	//   text: 'Warnings',
	// },
	{
		to: routesPath.SETTINGS_NETWORKS,
		svg: <PlugSvg fill='#E0E0E0' />,
		text: 'Networks',
	},
	// {
	//   to: routesPath.SETTINGS_GENERAL_INFORMATION,
	//   svg: <InformationOutlineSvg height="20" width="20" />,
	//   text: 'General information',
	// },
	{
		to: routesPath.SETTINGS_PERMISSIONS,
		svg: <PermissionsSvg fill='#E0E0E0' />,
		text: 'Permissions',
	},
]
export const SettingSideBar = () => {
	const { pathname } = useLocation()
	const handleBlock = async () => await Background.lock()

	return (
		<div className='h-[100%] w-[206px] border-r-[1px] border-solid border-dark_grey pt-[16px]'>
			<ul
				style={{ listStyleType: 'none', padding: 0 }}
				className='flex flex-col gap-y-[16px]'
			>
				{links.map(i => {
					return (
						<li key={i.to}>
							<Link to={i.to}>
								<div
									className={`flex items-center py-[12px] ext:px-[18px] tablet:px-[16px] ${
										pathname === i.to ? 'bg-dark_grey' : ''
									} hover:bg-dark_grey`}
								>
									<span className='w-[20px] h-[20px]'>{i.svg}</span>
									<p className='pl-[18px] text_button text-light-grey'>
										{i.text}
									</p>
								</div>
							</Link>
						</li>
					)
				})}
			</ul>
			<div className='px-[16px]'>
				<Button
					title='Block account'
					mode='transparent'
					onClick={handleBlock}
					className='w-[100%] mt-[40px]'
				/>
			</div>
		</div>
	)
}
