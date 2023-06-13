import { Link } from 'react-router-dom'
import { routesPath } from '../../../utils'
import {
	AdditionallySvg,
	ChevronLeftIcon,
	ContactsSvg,
	ExpandSvg,
	LockSvg,
	PermissionsSvg,
	PlugSvg,
} from '../Svg'
import Background from '../../services/Background'

const links = [
	{
		to: routesPath.SETTINGS_ADVANCED,
		svg: <AdditionallySvg />,
		text: 'Advanced',
	},
	{
		to: routesPath.SETTINGS_CONTACTS,
		svg: <ContactsSvg />,
		text: 'Contacts',
	},
	{
		to: routesPath.SETTINGS_SECURITY_PRIVACY,
		svg: <LockSvg />,
		text: 'Security and Privacy',
	},

	{
		to: routesPath.SETTINGS_NETWORKS,
		svg: <PlugSvg />,
		text: 'Networks',
	},
	{
		to: routesPath.SETTINGS_PERMISSIONS,
		svg: <PermissionsSvg />,
		text: 'Permissions',
	},
]

export const SettingsExtensionSideBar = () => {
	const handleExpand = () =>
		Background.showTab(`${window.location.origin}/accounts.html`, 'accounts')

	return (
		<ul style={{ listStyleType: 'none', padding: 0 }}>
			{links.map(i => {
				return (
					<li key={i.to}>
						<Link to={i.to}>
							<div className='flex justify-between items-center hover:bg-dark_grey mt-[16px] px-[12px] py-[12px]'>
								<div className='flex items-center'>
									<span className='w-[20px] h-[20px] svg_notActive_link'>
										{i.svg}
									</span>
									<p className='pl-[18px] text_ext text-light_grey'>{i.text}</p>
								</div>
								<div className='rotate-180'>
									<ChevronLeftIcon width='20' height='20' stroke='#E0E0E0' />
								</div>
							</div>
						</Link>
					</li>
				)
			})}
			<div
				className='flex justify-between items-center hover:bg-dark_grey mt-[16px] px-[12px] py-[12px] cursor-pointer'
				onClick={handleExpand}
			>
				<div className='flex items-center'>
					<p className='text_ext text-light_grey'>Expand view</p>
				</div>
				<div>
					<ExpandSvg width='20' height='20' stroke='#E0E0E0' />
				</div>
			</div>
		</ul>
		
	)
}
