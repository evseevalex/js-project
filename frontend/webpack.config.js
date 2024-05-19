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
				use: [MiniCssExtractPlugin.loader, , 'css-loader', 'sass-loader'],
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
		new HtmlWebpackPlugin({
			filename: 'login.html',
			template: 'src/templates/login.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income.html',
			template: 'src/templates/income.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'expenses.html',
			template: 'src/templates/expenses.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'expenses_add.html',
			template: 'src/templates/expenses_add.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'expenses_edit.html',
			template: 'src/templates/expenses_edit.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income_add.html',
			template: 'src/templates/income_add.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income_edit.html',
			template: 'src/templates/income_edit.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income_and_expenses.html',
			template: 'src/templates/income_and_expenses.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income_and_expenses_add.html',
			template: 'src/templates/income_and_expenses_add.html',
		}),
		new HtmlWebpackPlugin({
			filename: 'income_and_expenses_edit.html',
			template: 'src/templates/income_and_expenses_edit.html',
		}),
		new CopyPlugin({
			patterns: [
				{
					from: './src/assets/images',
					to: 'images',
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: 'styles/[name].css',
		}),
	],
}
