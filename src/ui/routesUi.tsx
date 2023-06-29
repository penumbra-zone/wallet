import { RouteObject } from 'react-router-dom'
import { routesPath } from '../utils'
import { SettingsExtensionSideBar } from './components'
import {
	ActiveMessage,
	Login,
	Main,
	Send,
	SettingsAdvanced,
	SettingsContacts,
	SettingsExtenion,
	SettingsNetworks,
	SettingsPermissions,
	SettingsSecurityPrivacy,
	Validators,
} from './containers'
import { RootUi } from './RootUi'

export const routesUi: RouteObject[] = [
	{
		element: <RootUi />,

		children: [
			{
				path: routesPath.HOME,
				element: <Main />,
			},
			{
				path: routesPath.LOGIN,
				element: <Login />,
			},

			{
				path: routesPath.SEND,
				element: <Send />,
			},
			{
				path: routesPath.VALIDATORS,
				element: <Validators />,
			},
			{
				path: routesPath.SETTINGS,
				element: <SettingsExtenion />,
				children: [
					{
						path: routesPath.SETTINGS,
						element: <SettingsExtensionSideBar />,
					},
					{
						path: routesPath.SETTINGS_SUPPORT,
						element: <h2>SUPPORT</h2>,
					},
					{
						path: routesPath.SETTINGS_ADVANCED,
						element: <SettingsAdvanced />,
					},
					{
						path: routesPath.SETTINGS_CONTACTS,
						element: <SettingsContacts />,
					},
					{
						path: routesPath.SETTINGS_SECURITY_PRIVACY,
						element: <SettingsSecurityPrivacy />,
					},
					{
						path: routesPath.SETTINGS_WARNINGS,
						element: <h2>SETTINGS_WARNINGS</h2>,
					},
					{
						path: routesPath.SETTINGS_NETWORKS,
						element: <SettingsNetworks />,
					},
					{
						path: routesPath.SETTINGS_GENERAL_INFORMATION,
						element: <h2>SETTINGS_GENERAL_INFORMATION</h2>,
					},
					{
						path: routesPath.SETTINGS_PERMISSIONS,
						element: <SettingsPermissions />,
					},
				],
			},
			{
				path: routesPath.ACTIVE_MESSAGE,
				element: <ActiveMessage />,
			},
		],
	},
]
