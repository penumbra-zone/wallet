import { Link } from 'react-router-dom'
import { routesPath } from '../../../utils'
import {
	ChevronLeftIcon,
	ContactsSvg,
	LockSvg,
	PermissionsSvg,
	PlugSvg,
} from '../Svg'

const links = [
	// {
	//   to: routesPath.SETTINGS,
	//   svg: <SettingsSvg />,
	//   text: 'Support',
	// },
	// {
	//   to: routesPath.SETTINGS_ADDITIONALLY,
	//   svg: <AdditionallySvg />,
	//   text: 'Additionally',
	// },
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
	// {
	//   to: routesPath.SETTINGS_WARNINGS,
	//   svg: <BellSvg />,
	//   text: 'Warnings',
	// },
	{
		to: routesPath.SETTINGS_NETWORKS,
		svg: <PlugSvg />,
		text: 'Networks',
	},
	// {
	//   to: routesPath.SETTINGS_GENERAL_INFORMATION,
	//   svg: <InformationOutlineSvg height="20" width="20" />,
	//   text: 'General information',
	// },
	{
		to: routesPath.SETTINGS_PERMISSIONS,
		svg: <PermissionsSvg />,
		text: 'Permissions',
	},
]

export const SettingsExtensionSideBar = () => {
	return (
		<ul style={{ listStyleType: 'none', padding: 0 }}>
			{links.map(i => {
				return (
					<li key={i.to}>
						<Link to={i.to}>
							<div className='flex justify-between items-center hover:bg-dark_grey mb-[12px] px-[16px] py-[11px]'>
								<div className='flex items-center'>
									<span
										className={`w-[20px] h-[20px] ${
											'svg_notActive_link'
											// i.to === routesPath.SETTINGS
											//   ? 'svg_notActive_link_stroke'
											//   : 'svg_notActive_link'
										}`}
									>
										{i.svg}
									</span>
									<p className={`pl-[18px] text_ext ${'text-light_brown'}`}>
										{i.text}
									</p>
								</div>
								<div className='rotate-180'>
									<ChevronLeftIcon width='20' height='20' stroke='#524B4B' />
								</div>
							</div>
						</Link>
					</li>
				)
			})}
		</ul>
	)
}
