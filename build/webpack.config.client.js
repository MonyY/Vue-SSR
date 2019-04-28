const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractPlugin = require('extract-text-webpack-plugin');
const baseConfig = require('./webpack.config.base');
const HTMLPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isDev = process.env.NODE_ENV === 'development';
const HOST = process.env.HOST;

const defaultPlugins = [
	new webpack.DefinePlugin({
		'process.env': {
			NODE_ENV: isDev ? '"development"' : '"production"'
		}
	}),
	new HTMLPlugin()
];

let webpackConfig;

if (isDev) {
	webpackConfig = merge(baseConfig, {
		devtool: '#cheap-module-eval-source-map',
		devServer: {
			port: 8080,
			host: HOST || 'localhost',
			overlay: {
				errors: true
			},
			hot: true
		},
		module: {
			rules: [
				{
					test: /\.styl(us)?$/,
					use: [
						'vue-style-loader', // 处理css热更新
						{
							loader: 'css-loader'
						},
						{
							loader: 'postcss-loader',
							options: {
								sourceMap: true
							}
						},
						'stylus-loader'
					]
				}
			]
		},
		plugins: defaultPlugins.concat([
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoEmitOnErrorsPlugin(),
			new VueLoaderPlugin()
		])
	});
} else {
	webpackConfig = merge(baseConfig, {
		entry: {
			app: path.join(__dirname, '../client/index.js'),
			vendor: ['vue']
		},
		output: {
			filename: '[name].[chunkhash:8].js'
		},
		module: {
			rules: [
				{
					test: /\.styl(us)?$/,
					use: ExtractPlugin.extract({
						fallback: 'vue-style-loader',
						use: [
							'css-loader',
							{
								loader: 'postcss-loader',
								options: {
									sourceMap: true
								}
							},
							'stylus-loader'
						]
					})
				}
			]
		},
		plugins: defaultPlugins.concat([
			new ExtractPlugin('styles.[contentHash:8].css'),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'vendor'
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'runtime'
			})
		])
	});
}

module.exports = webpackConfig;
