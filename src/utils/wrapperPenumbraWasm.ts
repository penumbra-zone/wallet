export let penumbraWasm

if (process.env.NODE_GOAL === 'local') {
	penumbraWasm = await require(process.env.LOCAL_PACKAGES_PATH)
} else {
	penumbraWasm = await require('penumbra-wasm')
}
