const path = require('path');

module.exports = {
  entry: './src/Game.js',
  mode: 'development',
  devtool: 'inline-source-map',
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
