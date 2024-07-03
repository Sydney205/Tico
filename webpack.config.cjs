const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './server.js',  
  target: 'node',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  externals: [nodeExternals()],  
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  mode: 'production',
  resolve: {
    fallback: {
      "async_hooks": false  
    }
  }
  ignoreWarnings: [
    {
      module: /express/,  // Adjust this to match the specific module
      message: /Critical dependency: the request of a dependency is an expression/
    }
  ]
};

