export let penumbraWasm

if (process.env.NODE_GOAL === 'local') {
	penumbraWasm = await require('../penumbra-wasm')
} else {
	penumbraWasm = await require('penumbra-wasm')
}
