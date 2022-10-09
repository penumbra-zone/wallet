const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = () => {
  const mode = process.env.NODE_ENV || 'development';
  const SOURCE_FOLDER = path.resolve(__dirname, 'src');
  const DIST_FOLDER = path.resolve(__dirname, 'dist');

  return {
    mode,
    entry: {
      popup: path.resolve(SOURCE_FOLDER, 'popup.js'),
      background: path.resolve(SOURCE_FOLDER, 'background.js'),
      contentscript: path.resolve(SOURCE_FOLDER, 'contentscript.js'),
      inpage: path.resolve(SOURCE_FOLDER, 'inpage.js'),
    },
    output: {
      filename: '[name].js',
      path: DIST_FOLDER,
      publicPath: './',
    },
    devtool: 'inline-source-map',
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
        // 'process/browser': require.resolve('process/browser'),
      },
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(SOURCE_FOLDER, 'copied'),
            to: DIST_FOLDER,
          },
        ],
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
      ],
    },
  };
};
