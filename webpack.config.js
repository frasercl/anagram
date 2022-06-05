const path = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const dist = path.join(__dirname, "dist");

module.exports = {
  entry: "./src/index.tsx",
  mode: "development",
  output: {
    path: dist,
    filename: "index.js"
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  devServer: {
    static: {
      directory: dist,
    },
    compress: true,
    port: 8000,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: "/node_modules/"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "src/crate"),
    }),
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
  ],
  experiments: {
    asyncWebAssembly: true
  }
};
