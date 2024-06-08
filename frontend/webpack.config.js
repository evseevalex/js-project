const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const devMode = true

module.exports = {
	entry: ['./src/app.js', './src/styles/styles.scss'],
	mode: 'development',
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.scss$/i,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
		],
	},
	devServer: {
		watchFiles: ['src/**/*.scss'],
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		historyApiFallback: true,
		compress: true,
		port: 9000,
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: 'index.html',
		}),
		new CopyPlugin({
			patterns: [
				{
					from: './src/templates',
					to: 'templates',
				},
				{
					from: './src/assets/images',
					to: 'images',
				},
			],
		}),
	],
}
