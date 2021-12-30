const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css压缩，主要使用 cssnano 压缩器
const safePostCssParser = require('postcss-safe-parser'); // 找到并修复css语法错误

const devMode = process.env.NODE_ENV !== 'production'

// 公用方法配置文件目录
function resolve(dir) {
    // join方法用于将多个字符串结合成一个路径字符串
    // __dirname：获取当前文件所在目录的完整绝对路径
    return path.join(__dirname, './', dir)
}

module.exports = {
    entry: {
        "main": "./src/index.tsx"
    },
    output: {
        // 指明编译好的文件所在目录
        path: path.resolve('./dist'),
        // 加上哈希值 就是[hash:8].
        filename: 'bundle.js'
    },
    module: {
        rules: [
            // {
            //     test: /\.(tsx|ts)$/,
            //     use: {
            //         loader: 'eslint-loader',
            //         options: {
            //             formatter: require('eslint-friendly-formatter') // 默认的错误提示方式
            //         }
            //     },
            //     enforce: 'pre', // 编译前检查
            //     exclude: /node_modules/, // 不检测的文件
            //     include: [__dirname + '/src'], // 要检查的目录
            // },
            {
                test: /\.css$/,
                use : [
                    { loader: 'style-loader' },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    }
                ]
            },
            {
                test: /\.less$/,
                use : [
                    { loader: 'style-loader' },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                        },
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            modifyVars: {
                                'primary-color': '#F56C1D',
                                'info-color': '#F56C1D'
                            },
                            javascriptEnabled: true
                        }
                    }
                ]
            },
            {
                test: /\.(tsx|ts|js)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "swc-loader",
                    options: {
                        jsc: {
                            parser: {
                                syntax: "typescript",
                                tsx: true,
                                dynamicImport: true,
                            }
                        }
                    }
                }
            },
            {
                test: /\.tsx?$/,
                loader: 'esbuild-loader',
                options: {
                    loader: 'tsx',
                    target: 'esnext'
                }
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'static/media/[name].[hash:8].[ext]'
                }
            },
            {
                loader: 'file-loader',
                exclude: [/\.(js|mjs|jsx|ts|tsx|css|less|png|jpg|gif|bmp|jpeg)$/, /\.html$/, /\.json$/],
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                }
            }
        ]
    },
    // 文件解析
    resolve: {
        extensions: ['.js', '.ts', ".tsx", '.json', '.less', '.css'], // 自动解析确定的拓展名,使导入模块时不带拓展名
        alias: { // 创建import或require的别名,让其自动解析确定的扩展,在引入模块时不带扩展名
            '@': resolve('src'),
            plume2: 'plume2/es5',
            "@/webapi": resolve("web_modules/webapi"),
            "api": resolve("web_modules/api"),
            "@/redux": resolve("src/redux"),
            "@/pages": resolve("src/pages"),
            "qmkit": resolve("web_modules/qmkit"),
            "biz": resolve("web_modules/biz"),
            "wmui": resolve("web_modules/wmui"),
        },
    },
    optimization: {
        minimizer: [
           new ESBuildMinifyPlugin({
               target: 'es2015'
            }),
        ]
    },
    // 插件配置
    plugins: [
        new NodePolyfillPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
        }),
        // 打包html插件
        // 如果先清空build在进行打包
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html', // 指定模板
            // title: '我是标题', // 设置打包后的html的标题
            // hash: true,
            // minify: {
            //     removeAttributeQuotes: true, // 让html去除双引号
            //     collapseWhitespace: true // 去除空格html都在一行
            // }
        }),
        new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
                parser: safePostCssParser,
                map: process.env.GENERATE_SOURCEMAP !== 'false'
                    ? {
                        inline: false,
                        annotation: true
                    }
                    : false
            }
        }),
    ],
    devtool: 'source-map',
    mode: 'development' // 更改生产模式
}