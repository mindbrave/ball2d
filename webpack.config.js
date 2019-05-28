const path = require("path");
const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        contentBase: "./",
        hot: false,
        openPage: "./index.html",
    },
    devtool: "eval-source-map",
    entry: "./src/main.ts",
    mode: "development",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
        ],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new CleanWebpackPlugin(["dist"]),
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new webpack.optimize.ModuleConcatenationPlugin(),
    ],
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ],
        modules: [path.resolve("./src"), "node_modules"],
    },
    externals: {
        "oimo": true,
        "cannon": true
    },
};
