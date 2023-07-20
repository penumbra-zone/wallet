# Penumbra dApp

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Extension Buf Transport](#extension_transport)
- [Methods](#methods)
- [Testing local wasm artifacts directory](#testing-local-wasm-artifacts-directory)
- [Error Codes](#error-codes)

<a id="overview"></a>

## Overview

Penumbra dApp is the canonical wallet functionality interface for the [Penumbra network](https://penumbra.zone).

<a id="getting-started"></a>

## Getting Started

To use the Penumbra dApp, you must first install the Penumbra wallet extension and import/create a new wallet. </br>
The Penumbra wallet extension is available for installation [in the Chrome store](https://chrome.google.com/webstore/detail/penumbra-wallet/lkpmkhpnhknhmibgnmmhdhgdilepfghe/). </br>
You can also build the wallet extension locally by following the [build instructions](https://github.com/penumbra-zone/wallet).</br>
After you've installed the extension, navigate to the dApp: https://app.testnet.penumbra.zone </br>

### 1.Building the site locally

- Building the site locally

  ```bash
  npm install
  ```

  ```bash
  npm run dev
  ```

### 2. Remote packages

Add library to your app.

- Configure registry

  ```bash
  npm config set @buf:registry https://buf.build/gen/npm/v1/
  ```

- Packages

  - bufbuild/connect-es

  ```bash
  npm install @buf/penumbra-zone_penumbra.bufbuild_connect-es@latest
  ```

  - bufbuild/es

  ```bash
  npm install @buf/penumbra-zone_penumbra.bufbuild_es@latest
  ```

  - bufbuild/connect-web

  ```bash
  npm install @buf/penumbra-zone_penumbra.bufbuild_connect-web@latest
  ```

### 3. Types for window object penumbra

Add to global.d.ts

```ts
import {
	AddressByIndexRequest,
	AddressByIndexResponse,
	AssetsRequest,
	AssetsResponse,
	ChainParametersRequest,
	ChainParametersResponse,
	FMDParametersRequest,
	FMDParametersResponse,
	NotesRequest,
	StatusRequest,
	StatusResponse,
	TransactionInfoByHashRequest,
	TransactionInfoByHashResponse,
	TransactionPlannerRequest,
	TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'

declare global {
	interface Window {
		penumbra: Penumbra.PenumbraApi
	}
}

export declare namespace Penumbra {
	type PenumbraApi = {
		requestAccounts: () => Promise<[string]>
		on(event: Events, cb: (state: any) => any, args?: any): object
		getChainParameters: (
			request?: ChainParametersRequest
		) => Promise<ChainParametersResponse>
		getStatus: (request?: StatusRequest) => Promise<StatusResponse>
		getFmdParameters: (
			request?: FMDParametersRequest
		) => Promise<FMDParametersResponse>
		signTransaction: (request: any) => Promise<TransactionResponse>
		getTransactionInfoByHash: (
			request: TransactionInfoByHashRequest
		) => Promise<TransactionInfoByHashResponse>
		getAddressByIndex: (
			request: AddressByIndexRequest
		) => Promise<AddressByIndexResponse>
		getTransactionPlanner: (
			request: TransactionPlannerRequest
		) => Promise<TransactionPlannerResponse>
	}
}

export type TransactionResponse = {
	id: number
	jsonrpc: string
	result: {
		code: 1 | 0
		codespace: string
		data: string
		hash: string
		log: string
	}
}

export type Events =
	| 'state'
	| 'status'
	| 'balance'
	| 'assets'
	| 'transactions'
	| 'notes'
	| 'accountsChanged'
```

<a id="extension_transport"></a>

## Extension Buf Transport

```ts
import { createRouterTransport } from '@bufbuild/connect'
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-es/penumbra/view/v1alpha1/view_connect'
import {
	AddressByIndexRequest,
	AssetsRequest,
	AssetsResponse,
	BalanceByAddressRequest,
	BalanceByAddressResponse,
	ChainParametersRequest,
	ChainParametersResponse,
	FMDParametersRequest,
	FMDParametersResponse,
	NotesRequest,
	NotesResponse,
	StatusRequest,
	StatusResponse,
	StatusStreamRequest,
	StatusStreamResponse,
	TransactionInfoByHashRequest,
	TransactionInfoByHashResponse,
	TransactionInfoRequest,
	TransactionInfoResponse,
	TransactionPlannerRequest,
	TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb'

export const extensionTransport = (s: typeof ViewProtocolService) =>
	createRouterTransport(({ service }) => {
		let receiveMessage: (value: unknown) => void = function () {}
		function waitForNextMessage() {
			return new Promise(resolve => {
				receiveMessage = resolve
			})
		}
		async function* createMessageStream() {
			while (true) {
				yield waitForNextMessage()
			}
		}
		service(s, {
			status: async (message: StatusRequest) => {
				const response = await window.penumbra.getStatus()

				return new StatusResponse(response)
			},
			addressByIndex: async (request: AddressByIndexRequest) => {
				const response = await window.penumbra.getAddressByIndex(request)
				return response
			},

			transactionPlanner: async (message: TransactionPlannerRequest) => {
				const response = await window.penumbra.getTransactionPlanner(message)

				return new TransactionPlannerResponse(response)
			},
			transactionInfoByHash: async (message: TransactionInfoByHashRequest) => {
				const response = await window.penumbra.getTransactionInfoByHash(message)

				return new TransactionInfoByHashResponse(response)
			},
			fMDParameters: async (message: FMDParametersRequest) => {
				const response = await window.penumbra.getFmdParameters()

				return new FMDParametersResponse(response)
			},
			chainParameters: async (message: ChainParametersRequest) => {
				const response = await window.penumbra.getChainParameters()

				return new ChainParametersResponse(response)
			},
			async *statusStream(message: StatusStreamRequest) {
				window.penumbra.on('status', status => receiveMessage(status))

				for await (const res of createMessageStream()) {
					yield new StatusStreamResponse(res)
				}
			},
			async *assets(message: AssetsRequest) {
				window.penumbra.on('assets', asset => receiveMessage(asset))

				for await (const res of createMessageStream()) {
					yield new AssetsResponse(res)
				}
			},
			async *balanceByAddress(message: BalanceByAddressRequest) {
				window.penumbra.on('balance', balance => receiveMessage(balance))

				for await (const res of createMessageStream()) {
					yield new BalanceByAddressResponse(res)
				}
			},
			async *notes(message: NotesRequest) {
				window.penumbra.on('notes', note => receiveMessage(note))

				for await (const res of createMessageStream()) {
					yield new NotesResponse(res)
				}
			},
			async *transactionInfo(message: TransactionInfoRequest) {
				window.penumbra.on(
					'transactions',
					tx => receiveMessage(tx),
					message.toJson()
				)

				for await (const res of createMessageStream()) {
					yield new TransactionInfoResponse(res)
				}
			},
		})
	})
```

## Create promise client

```ts
import { createPromiseClient } from '@bufbuild/connect'
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.bufbuild_connect-es/penumbra/view/v1alpha1/view_connect'

const client = createPromiseClient(
	ViewProtocolService,
	extensionTransport(ViewProtocolService)
)
```

<a id="methods"></a>

## Methods

- [User Info](#user-info)

  - [login](#login)

- [service ViewProtocolService](#view_service)

  - [Status](#status)
  - [Status Stream](#status_stream)
  - [Notes](#notes)
  - [Assets](#assets)
  - [ChainParameters](#chain_parameters)
  - [FMDParameters](#fmd_parameters)
  - [AddressByIndex](#address_by_index)
  - [BalanceByAddress](#balance_by_address)
  - [TransactionInfoByHash](#tx_by_hash)
  - [TransactionInfo](#tx_info)
  - [TransactionPlanner](#tx_planner)

- [other](#other)

  - [send transaction](#send_tx)

<a id="user-info"></a>

# User Info

<a id="login"></a>

#### login

Authenticates user with his/her account;

**Usage:**

```ts
const poll = (
	resolve: (result: boolean) => void,
	reject: (...args: unknown[]) => void,
	attempt = 0,
	retries = 30,
	interval = 100
) => {
	if (attempt > retries) return resolve(false)

	if (typeof window !== 'undefined' && 'undefined') {
		return resolve(true)
	} else setTimeout(() => poll(resolve, reject, ++attempt), interval)
}

const _isPenumbraInstalled = new Promise(poll)

export async function isPenumbraInstalled() {
	return _isPenumbraInstalled
}

const [walletAddress, setWalletAddress] = useState<string>('')
const [isPenumbra, setIsPenumbra] = useState<boolean>(false)

const checkIsPenumbraInstalled = async () => {
	const isInstalled = await isPenumbraInstalled()
	setIsPenumbra(isInstalled)
}

useEffect(() => {
	checkIsPenumbraInstalled()
}, [])

useEffect(() => {
	if (!isPenumbra) return
	addWalletListener(isPenumbra)
}, [isPenumbra])

const addWalletListener = async (isPenumbra: boolean) => {
	if (isPenumbra) {
		window.penumbra.on('accountsChanged', (accounts: [string]) => {
			setWalletAddress(accounts[0])
		})
	} else {
		/* Penumbra is not installed */
		setWalletAddress('')
		console.log('Please install Penumbra Wallet')
	}
}

const signin = async () => {
	if (isPenumbra) {
		try {
			/* Penumbra is installed */
			const accounts = await window.penumbra.requestAccounts()
			setWalletAddress(accounts[0])
		} catch (err) {
			console.error(err)
		}
	} else {
		/* Penumbra is not installed */
		console.log('Please install Penumbra Wallet')
	}
}
```

**Output example:**

```js
;[
	'penumbrav2t13vh0fkf3qkqjacpm59g23ufea9n5us45e4p5h6hty8vg73r2t8g5l3kynad87uvn9eragf3hhkgkhqe5vhngq2cw493k48c9qg9ms4epllcmndd6ly4v4dwwjcnxaxzjqnlvnw',
]
```

<a id="view_service"></a>

# service ViewProtocolService

The view protocol is used by a view client, who wants to do some transaction-related actions, to request data from a view service, which is responsible for synchronizing and scanning the public chain state with one or more full viewing keys.

View protocol requests optionally include the account group ID, used to identify which set of data to query.

- [Status](#status)
- [Status Stream](#status_stream)
- [Notes](#notes)
- [Assets](#assets)
- [ChainParameters](#chain_parameters)
- [FMDParameters](#fmd_parameters)
- [AddressByIndex](#address_by_index)
- [BalanceByAddress](#balance_by_address)
- [TransactionInfoByHash](#tx_by_hash)
- [TransactionInfo](#tx_info)
- [TransactionPlanner](#tx_planner)

<a id="status"></a>

## Status

Get current status of chain sync

```js
const request = new StatusRequest({})
const response = await client.status(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusResponse)

<a id="status_stream"></a>

## Status Stream

Queries for notes that have been accepted by the core.chain.v1alpha1.

```js
const request = new StatusStreamRequest({})
for await (const status of client.statusStream(statusRequest)) {
	console.log(status)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusStreamRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusStreamResponse)

<a id="status_stream"></a>

## Status Stream

Queries for notes that have been accepted by the core.chain.v1alpha1.

```js
const request = new StatusStreamRequest({})
for await (const status of client.statusStream(statusRequest)) {
	console.log(status)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusStreamRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.StatusStreamResponse)

<a id="notes"></a>

## Notes

Queries for notes that have been accepted by the core.chain.v1alpha1.

```js
const request = new NotesRequest({})
for await (const note of client.notes(statusRequest)) {
	console.log(note)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.NotesRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.NotesResponse)

<a id="assets"></a>

## Assets

Queries for assets that have been accepted by the core.chain.v1alpha1.

```js
const request = new AssetsRequest({})
for await (const asset of client.assets(request)) {
	console.log(asset)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.AssetsRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.AssetsResponse)

<a id="chain_parameters"></a>

## ChainParameters

Query for the current chain parameters.

```js
const request = new ChainParametersRequest({})
const response = await client.chainParameters(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.ChainParametersRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.ChainParametersResponse)

<a id="fmd_parameters"></a>

## FMDParameters

Query for the current FMD parameters.

```js
const request = new FMDParametersRequest({})
const response = await client.fMDParameters(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.FMDParametersRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.FMDParametersResponse)

<a id="address_by_index"></a>

## AddressByIndex

Query for an address given an address index

```js
const request = new AddressByIndexRequest({})
const response = await client.addressByIndex(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.AddressByIndexRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.AddressByIndexResponse)

<a id="balance_by_address"></a>

## BalanceByAddress

Query for balance of a given address

```js
const request = new BalanceByAddressRequest({})
for await (const balance of client.balanceByAddress(request)) {
	console.log(balance)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.BalanceByAddressRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.BalanceByAddressResponse)

<a id="tx_by_hash"></a>

## TransactionInfoByHash

Query for a given transaction by its hash.

```js
const request = new BalanceByAddressRequest({})
const response = await client.transactionInfoByHash(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionInfoByHashRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionInfoByHashResponse)

<a id="tx_info"></a>

## TransactionInfo

Query for the full transactions in the given range of blocks.

```js
const request = new TransactionInfoRequest({})
for await (const balance of client.transactionInfo(request)) {
	console.log(balance)
}
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionInfoRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionInfoResponse)

<a id="tx_planner"></a>

## TransactionPlanner

Query for a transaction plan

```js
const request = new TransactionPlannerRequest({})
const response = await client.transactionPlanner(request)
```

[**Parameters**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionPlannerRequest)

[**Response**](https://buf.build/penumbra-zone/penumbra/docs/main:penumbra.view.v1alpha1#penumbra.view.v1alpha1.TransactionPlannerResponse)

<a id="other"></a>

# Other

<a id="send_tx"></a>

## Send transaction

```js
const client = createPromiseClient(ViewProtocolService,extensionTransport(ViewProtocolService))

const transactionPlan = (await client.transactionPlanner(new TransactionPlannerRequest({
	outputs: [
		{
			value: {
				amount: {
					lo: [amont * 10 ** exponents],
					hi: 0
				},
			assetId:
				{ inner: [assetId]
				},
			},
			address: {
				inner: [receiver as Uint8Array],
				altBech32m: [reciever],
			},
		},
	],
}))).plan


const tx = await window.penumbra.signTransaction(transactionPlan?.toJson())
```

<a id='#testing-local-wasm-artifacts-directory'></a>

## Testing local wasm artifacts directory

### 1. Add the full path to the wasm artifacts directory to .env

 ```bash
  WASM_ARTIFACTS_DIRECTORY_PATH= <full_path>
  ```

### 2. Run command

 ```bash
 npm run dev:local
  ```

## Error Codes

| Error's class | Code | Type | Example |
| :------------ | :--- | :--- | :------ |
|               |      |      |         |
