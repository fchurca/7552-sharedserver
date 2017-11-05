var webpack = require('webpack');
var path = require('path');

module.exports = {

	entry: {
		app: './src/app.js',
		userpage: './src/userspage.js',
		businessuserpage: './src/businessuserspage.js',
		appserverpage: './src/appserverspage.js'
	},
	output: {
		path: path.join(__dirname, 'public'),
		filename: 'build/[name].bundle.js',
		sourceMapFilename: 'build/[name].bundle.map'
	},
	devtool: '#source-map',
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				exclude: /(node_modules)/,
				query: {
					presets: ['react', 'es2015']
				}
			}
		]
	}
}