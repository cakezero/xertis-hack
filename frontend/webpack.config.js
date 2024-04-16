module.exports = {
  entry: './bundler.js', // Your main entry point
  output: {
    filename: 'bundle.js', // Name of the output bundle file
    path: path.resolve(__dirname, 'dist'), // Output directory (optional)
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Target all JavaScript files
        exclude: /node_modules/, // Exclude node_modules directory
      },
    ],
  },
};