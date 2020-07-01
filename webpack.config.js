/* global __dirname */
/* global process */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsWebpackPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

/* less全局变量（主要为了重置antd的less全局变量） */
const lessModifyVars = require('./src/config/less.js');

const config = {
    entry: path.resolve(__dirname, 'src/index.js'),
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules|bower_components/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: [
                            '@babel/plugin-transform-runtime',
                            '@babel/syntax-dynamic-import',
                            [
                                'import',
                                {
                                    libraryName: 'antd',
                                    libraryDirectory: 'es',
                                    style: true
                                }
                            ]
                        ]
                    }
                }]
            },
            {
                test: /\.(jpg|png|svg|gif|ico|mp4)$/,
                use: [
                    { loader: 'file-loader', options: { outputPath: 'static' } }
                ]
            }
        ]
    }
};

/* 插件 */
const plugins = [
    new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        favicon: path.resolve(__dirname, 'src/public/favicon.ico')
    })
];

/* 代码分块 */
const optimization = {};

/* 开发模式 */
if (process.env.NODE_ENV === 'development') {
    plugins.push(new webpack.HotModuleReplacementPlugin());

    config.output = {
        filename: '[name].js',
        path: '/build',
        publicPath: '/',
        pathinfo: false
    };
    config.devtool = 'cheap-module-eval-source-map';
    config.devServer = {
        port: 30001,
        contentBase: path.resolve(__dirname, 'src/public'),
        //before: require(path.resolve(__dirname, 'src/local-service/index.js')),
        hot: false,
        /* 访问内容的重写（当http请求的地址匹配不到内容时，根据重写规则重写返回内容，可用于解决前端路由页面刷新时路由不匹配的问题） */
        historyApiFallback: true
    };
    config.module.rules.push({
        test: /\.(le|c)ss$/,
        use: [
            { loader: 'style-loader' },
            'css-loader',
            {
                loader: 'less-loader',
                options: { javascriptEnabled: true, modifyVars: lessModifyVars }
            }
        ]
    });
    config.plugins = plugins;
}

/* 发布模式 */
if (process.env.NODE_ENV === 'production') {
    plugins.push(new CleanWebpackPlugin([path.resolve(__dirname, 'build')]));
    plugins.push(new MiniCssExtractPlugin({
        filename: '[name].[chunkHash].css',
        chunkFilename: '[name].[chunkHash].css'
    }));
    plugins.push(new CopyWebpackPlugin([
        {
            from: path.resolve(__dirname, 'src/public/antd_icon_font'),
            to: 'antd_icon_font', toType: 'dir'
        }
    ]));
    plugins.push(
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, 'src/global.js')
        })
    );

    optimization.runtimeChunk = 'single';
    optimization.splitChunks = {
        chunks: 'all',
        name: true,
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all'
            }
        }
    };
    optimization.minimizer = [
        new UglifyJsWebpackPlugin({
            sourceMap: false
        })
    ];

    config.output = {
        filename: '[name].[chunkHash].js',
        path: path.resolve(__dirname, 'build'),
        publicPath: '/'
    };
    config.module.rules.push({
        test: /\.(le|c)ss$/,
        use: [
            { loader: MiniCssExtractPlugin.loader },
            'css-loader',
            {
                loader: 'less-loader',
                options: { javascriptEnabled: true, modifyVars: lessModifyVars }
            }
        ]
    });
    config.plugins = plugins;
    config.optimization = optimization;
}

module.exports = config;
