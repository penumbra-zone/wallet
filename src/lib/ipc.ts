import { Source } from 'callbag'
import create from 'callbag-create'
import filter from 'callbag-filter'
import map from 'callbag-map'
import pipe from 'callbag-pipe'
import subscribe from 'callbag-subscribe'
import tap from 'callbag-tap'
import take from 'callbag-take'
import { nanoid } from 'nanoid'
import invariant from 'tiny-invariant'

type ApiObject<K extends string> = Record<
	K,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(...args: any[]) => Promise<unknown>
>

interface MethodCallRequest<K> {
	id: string
	method: K
	args: unknown[]
}

export interface MethodCallRequestPayload<K> {
	penumbraMethodCallRequest: MethodCallRequest<K>
}

type MethodCallResponse<T> =
	| { id: string; isError?: never; data: T }
	| { id: string; isError: true; error: { message: string } }

export interface MethodCallResponsePayload<T = unknown> {
	penumbraMethodCallResponse?: MethodCallResponse<T>
}

const PENUMBRA_PING = 'PENUMBRA_PING'
const PENUMBRA_PONG = 'PENUMBRA_PONG'

export function createIpcCallProxy<K extends string, T extends ApiObject<K>>(
	sendRequest: (
		payload: typeof PENUMBRA_PING | MethodCallRequestPayload<string>
	) => void,
	responseSource: Source<
		| typeof PENUMBRA_PONG
		| MethodCallResponsePayload<Awaited<ReturnType<T[keyof T]>>>
	>
) {
	let connectionPromise: Promise<void> | null = null

	function ensureConnection() {
		connectionPromise ??= new Promise<void>(resolve => {
			let retryTimeout: ReturnType<typeof setTimeout>

			function sendPing() {
				sendRequest(PENUMBRA_PING)
				retryTimeout = setTimeout(sendPing, 1000)
			}
			pipe(
				responseSource,
				subscribe({
					next: res => {
						if (res !== PENUMBRA_PONG) return
						clearInterval(retryTimeout)
						resolve()
					},
					complete: () => {
						connectionPromise = null
					},
				})
			)
			sendPing()
		})
		return connectionPromise
	}

	function getIpcMethod<Method extends K>(method: Method) {
		return async (...args: Parameters<T[Method]>) => {
			await ensureConnection()
			const id = nanoid()
			const request = {
				penumbraMethodCallRequest: {
					id,
					method,
					args,
				},
			}

			sendRequest(request)

			return new Promise<Awaited<ReturnType<T[Method]>>>((resolve, reject) => {
				pipe(
					responseSource,
					map(data =>
						typeof data === 'object'
							? data.penumbraMethodCallResponse
							: undefined
					),
					filter(res => res?.id === request.penumbraMethodCallRequest.id),
					take(1),
					subscribe(res => {
						invariant(res)
						if (res.isError) reject(res.error)
						//@ts-ignore
						else resolve(res.data)
					})
				)
			})
		}
	}

	return new Proxy({} as T, {
		get: (target, method: K) => {
			if (!target[method]) {
				target[method] = getIpcMethod(method) as T[K]
			}
			return target[method]
		},
	})
}

export function fromPostMessage() {
	return create(next => {
		function handleMessage(event: MessageEvent) {
			if (
				event.origin !== location.origin ||
				event.source !== window ||
				!event.data
			)
				return

			next(event.data)
		}
		addEventListener('message', handleMessage)

		return () => {
			removeEventListener('message', handleMessage)
		}
	})
}

export function fromPort(port) {
	return create((next, error, complete) => {
		function handleDisconnect() {
			port.onDisconnect.removeListener(handleDisconnect)
			port.onMessage.removeListener(handleMessage)
			complete()
		}

		function handleMessage(message) {
			next(message)
		}

		port.onDisconnect.addListener(handleDisconnect)
		port.onMessage.addListener(handleMessage)
	})
}

export function filterIpcRequests<K>(
	source: Source<MethodCallRequestPayload<K>>
) {
	return pipe(
		source,
		filter<
			typeof PENUMBRA_PONG | typeof PENUMBRA_PING | MethodCallRequestPayload<K>
		>(
			data =>
				data === PENUMBRA_PING ||
				data === PENUMBRA_PONG ||
				data.penumbraMethodCallRequest != null
		)
	)
}

export function handleMethodCallRequests<K extends string>(
	api: ApiObject<K>,
	sendResponse: (
		result: typeof PENUMBRA_PONG | MethodCallResponsePayload<unknown>
	) => void
) {
	return tap<typeof PENUMBRA_PING | MethodCallRequestPayload<K>>(async data => {
		if (data === PENUMBRA_PING) return sendResponse(PENUMBRA_PONG)

		if (!data.penumbraMethodCallRequest) return

		const { id, method, args } = data.penumbraMethodCallRequest

		try {
			const res = await api[method](...args)

			try {
				sendResponse({
					penumbraMethodCallResponse: { id, data: res },
				})
			} catch (err) {
				if (
					err instanceof DOMException &&
					(err.code === 25 || err.name === 'DataCloneError')
				) {
					sendResponse({
						penumbraMethodCallResponse: {
							id,
							data: JSON.parse(JSON.stringify(res)),
						},
					})
					return
				}
				throw err
			}
		} catch (err) {
			sendResponse({
				penumbraMethodCallResponse: {
					id,
					isError: true,
					error:
						err instanceof Response
							? { message: await err.text() }
							: err && typeof err === 'object'
							? {
									...err,
									message: String('message' in err ? err.message : err),
							  }
							: { message: String(err) },
				},
			})
		}
	})
}
