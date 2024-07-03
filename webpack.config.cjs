const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js', 
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/' 
  },
  externals: [nodeExternals()], 
  module: {
    rules: [
      {
        test: /\.html$/,
        use: ['html-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', 
      filename: 'index.html'
    })
  ],
  mode: 'production',
  resolve: {
    fallback: {
      "async_hooks": false 
    }
  },
  ignoreWarnings: [
    {
      module: /express/, 
      message: /Critical dependency: the request of a dependency is an expression/
    }
  ]
};

