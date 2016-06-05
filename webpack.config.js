module.exports = {
  context: __dirname + "/app",
  entry: "./scripts/main.js",
  output: {
    path: __dirname + "/",
    publicPath: '/',
    filename: "bundle.js"
  }
};
