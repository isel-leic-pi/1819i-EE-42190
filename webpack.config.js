'use strict'


const path = require('path')
const destDir = path.resolve(__dirname, 'dist')

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: {
        index: './app/js/entry.js'
    },
    output: {
        filename: 'bundle.js',
        path: destDir
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './app/views/index.html',
            chunks: ['index'],
            filename: 'index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(hbs)$/,
                use: 'raw-loader'
            },
            {
                test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000',
            },
            {
                test: /\.(html)$/,
                use: 'html-loader'
            }
        ]
    }
}

