const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const svgToMiniDataURI = require('mini-svg-data-uri')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = () => {
	const mode = process.env.NODE_ENV || 'development'
	const SOURCE_FOLDER = path.resolve(__dirname, 'src')
	const DIST_FOLDER = path.resolve(__dirname, 'dist')

	return {
		mode,
		entry: {
			popup: path.resolve(SOURCE_FOLDER, 'ui/popup'),
			'accounts/account': path.resolve(SOURCE_FOLDER, 'accounts/account'),
			background: path.resolve(SOURCE_FOLDER, 'background.ts'),
			contentscript: path.resolve(SOURCE_FOLDER, 'contentscript.ts'),
			inpage: path.resolve(SOURCE_FOLDER, 'inpage.ts'),
		},
		output: {
			filename: '[name].js',
			path: DIST_FOLDER,
			publicPath: './',
		},
		devtool: 'inline-source-map',
		optimization: {
			splitChunks: {
				cacheGroups: {
					commons: {
						name: 'commons',
						test: /.js$/,
						maxSize: 4000000,
						chunks: chunk => ['ui', 'accounts/account'].includes(chunk.name),
					},
				},
			},
		},
		resolve: {
			extensions: [
				'.ts',
				'.tsx',
				'.js',
				'.jsx',
				'.json',
				'.styl',
				'.css',
				'.png',
				'.jpg',
				'.gif',
				'.svg',
				'.woff',
				'.woff2',
				'.ttf',
				'.otf',
			],
			fallback: {
				stream: require.resolve('stream-browserify'),
				util: require.resolve('util'),
				// buffer: require.resolve('buffer'),
				'process/browser': require.resolve('process/browser'),
			},
		},

		plugins: [
			new CleanWebpackPlugin({
				cleanStaleWebpackAssets: false,
			}),
			new CopyWebpackPlugin({
				patterns: [
					{
						from: path.join(SOURCE_FOLDER, 'copied'),
						to: DIST_FOLDER,
					},
				],
			}),
			new HtmlWebpackPlugin({
				title: 'Penumbra Wallet',
				filename: 'accounts.html',
				template: path.resolve(SOURCE_FOLDER, 'accounts.html'),
				hash: true,
				chunks: ['commons', 'accounts/account'],
			}),
			new HtmlWebpackPlugin({
				title: 'Penumbra Wallet',
				filename: 'notification.html',
				template: path.resolve(SOURCE_FOLDER, 'notification.html'),
				hash: true,
				chunks: ['commons', 'popup'],
			}),
			new HtmlWebpackPlugin({
				title: 'Penumbra Wallet',
				filename: 'popup.html',
				template: path.resolve(SOURCE_FOLDER, 'popup.html'),
				hash: true,
				chunks: ['commons', 'popup'],
			}),
			new webpack.ProvidePlugin({
				process: 'process/browser',
			}),
			new webpack.ProvidePlugin({
				Buffer: ['buffer', 'Buffer'],
			}),
		],
		experiments: {
			asyncWebAssembly: true,
		},
		module: {
			rules: [
				{
					use: 'ts-loader',
					test: /\.tsx?$/,
					exclude: /node_modules/,
				},
				{
					test: /\.(jsx?)$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
				},
				{
					test: /\.css$/i,
					include: path.resolve(SOURCE_FOLDER),
					use: ['style-loader', 'css-loader', 'postcss-loader'],
				},
				{
					test: /\.svg$/,
					type: 'asset',
					generator: {
						filename: 'assets/img/[name].[ext]',
						dataUrl: content => svgToMiniDataURI(content.toString()),
					},
				},
				{
					test: /\.(png|jpe?g|gif)$/,
					type: 'asset/resource',
					generator: {
						filename: 'assets/img/[name][ext]',
					},
				},
				{
					test: /\.(woff2?|ttf)$/,
					type: 'asset/resource',
					generator: {
						filename: 'assets/fonts/[name][ext]',
					},
				},
			],
		},
	}
}
