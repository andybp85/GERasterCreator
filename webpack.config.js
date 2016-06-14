var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('core-js');

module.exports = {
    context: path.join(__dirname, 'gegrids'),
    resolve: {
        modulesDirectories: ["node_modules", "scripts", "stylesheets"],
        extensions: ["", ".js", ".scss"],
        alias: {
            config: path.join(__dirname, 'config', process.env.NODE_ENV)
        }
    },
    entry: {
        app: ["./app.js", "./stylesheets/app.scss"],
    },
    devtool: "#inline-source-map",
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: "bundle.js",
        sourceMapFilename: "[file].map"
    },
    devServer: {
      contentBase: ".",
      inline: true,
      watch: true,
      // hot: true
    },
    module: {
      loaders: [
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
              presets: ['es2015'],
              plugins: ['transform-runtime']
            },
          },
          {
            test: /\.scss$/,
            loader: ExtractTextPlugin.extract('css-loader?sourceMap!sass-loader?sourceMap=true&sourceMapContents=true')

          }
      ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css')
    ]
    // plugins: [ new webpack.HotModuleReplacementPlugin(), new ExtractTextPlugin('styles.css')]

};
