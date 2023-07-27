export let penumbraWasm

if (process.env.NODE_GOAL === 'local') {
	console.log(process.env.NODE_GOAL)

	penumbraWasm = await require(process.env.WASM_ARTIFACTS_DIRECTORY_PATH)
} else {
	penumbraWasm = await require('penumbra-wasm')
}
