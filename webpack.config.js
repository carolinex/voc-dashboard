const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
    publicPath: ''
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
			  test: /\.(s?css)$/,
			  use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
			},
			{
				test: /\.html$/,
				use: ['html-loader']
			},
      {
        test: /\.(eot|ttf|woff2?|otf)$/,
        use: 'file-loader'
      },
			{
        test: /\.(jpe?g|png|gif|svg)$/,
        use: [
					{
	          loader: 'file-loader',
	          options: {
	            name:'images/[name].[ext]'
          	}
        	}
				]
      }
		]
	},
  /*target: 'node',*/
	/*externals : { canvas: {} },*/
  devServer: {
    contentBase: "dist",
    hot: true
  },
	devtool: false,
	plugins: [
		new CopyWebpackPlugin([
        { from: './src/images', to: 'images' }
		]),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './src/html/index.html'
		}),
    new webpack.HotModuleReplacementPlugin()
	],
	performance: {
	  hints: false
	}
}


/*const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './dist',
    hot: true
  }
};*/
