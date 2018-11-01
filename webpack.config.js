const path = require('path');

const env = process.env.NODE_ENV || 'production'

module.exports = {
  entry: './src/Game',
  mode: env,
  devtool: env === 'development' ? 'inline-source-map' : false,
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: false,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  output: {
    library: 'Tetris',
    libraryExport: 'default',
    filename: 'tetris.js',
    path: path.resolve(__dirname, 'dist')
  }
};
