const path = require('node:path')
const { zip } = require('zip-a-folder')
const platforms = require('./platforms.json')
require('dotenv').config()

const DIST_FOLDER = path.resolve(__dirname, '..', 'dist')

platforms.forEach(async platformName => {
	await zip(
		path.resolve(DIST_FOLDER, platformName),
		path.resolve(
			DIST_FOLDER,
			`penumbra-wallet-${process.env.PENUMBRA_VERSION}-${platformName}.zip`
		)
	)
})
