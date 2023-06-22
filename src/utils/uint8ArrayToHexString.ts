export const uint8ArrayToHexString = (uint8Array: Uint8Array): string => {
	return String.fromCharCode.apply(null, uint8Array)
}
