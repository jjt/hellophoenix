module.exports = {
  entry: "./web/static/js/app.js",
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
    ]
  },
  output: {
    path: "./priv/static/js",
    filename: "bundle.js"
  }
};
