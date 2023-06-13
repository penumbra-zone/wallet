import { RouteObject } from 'react-router-dom'
import {
	CreatePassword,
	ImportSeed,
	Login,
	Main,
	Rules,
	SeedPharseRules,
	SeedPhrase,
	SelectAction,
	Welcome,
	Settings,
	SettingsSecurityPrivacy,
	SettingsNetworks,
	BalanceDetail,
	Validators,
	Send,
	SettingsContacts,
	SettingsPermissions,
	SettingsAdvanced,
} from '../ui/containers'
import { RootAccounts } from './RootAccounts'
import { routesPath } from '../utils'

export const routes: RouteObject[] = [
	{
		element: <RootAccounts />,

		children: [
			{
				path: routesPath.HOME,
				element: <Main />,
			},
			{
				path: routesPath.WELCOME,
				element: <Welcome />,
			},
			{
				path: routesPath.RULES,
				element: <Rules />,
			},
			{
				path: routesPath.SELECT_ACTION,
				element: <SelectAction />,
			},
			{
				path: routesPath.CREATE_PASSWORD,
				element: <CreatePassword />,
			},
			{
				path: routesPath.SEED_PHRASE_RULES,
				element: <SeedPharseRules />,
			},
			{
				path: routesPath.SEED_PHRASE,
				element: <SeedPhrase />,
			},

			{
				path: routesPath.LOGIN,
				element: <Login />,
			},
			{
				path: routesPath.IMPORT_SEED_PHRASE,
				element: <ImportSeed />,
			},
			{
				path: routesPath.BALANCE_DETAIL,
				element: <BalanceDetail />,
			},
			{
				path: routesPath.VALIDATORS,
				element: <Validators />,
			},
			{
				path: routesPath.SEND,
				element: <Send />,
			},
			{
				path: routesPath.SETTINGS,
				element: <Settings />,
				children: [
					// {
					//   path: routesPath.SETTINGS,
					//   element: <h2>SUPPORT</h2>,
					// },
					{
						path: routesPath.SETTINGS,
						element: <SettingsAdvanced />,
					},
					{
						path: routesPath.SETTINGS_CONTACTS,
						// path: routesPath.SETTINGS_CONTACTS,
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
		],
	},
]
