/*
 * @Author: yanxu gong
 * @Date: 2020-02-25 16:42:25
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-07-01 17:20:57
 * @Descripttion: 项目配置
 */

const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const TerserPlugin = require('terser-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i

module.exports = {
  baseUrl: './', // 默认‘/’，部署应用包时的基本 URL
  outputDir: process.env.outputDir || 'dist', // 输出文件目录
  assetsDir: 'static', // 相对于 outputDir 静态资源目录
  lintOnSave: false, // 是否每次保存代码都启用 eslint 验证
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false, // 生产环境是否启用 source map
  parallel: require('os').cpus().length > 1, // 用于提高项目打包速度
  // 配置 proxy 跨域
  // devServer: {
  //   open: IS_PROD,
  //   host: '0.0.0.0',
  //   port: 8080,
  //   https: false,
  //   hotOnly: false,
  //   proxy: {
  //     '/api': {
  //       target: process.env.VUE_APP_BASE_API || 'http://127.0.0.1:8080',
  //       changeOrigin: true,
  //     },
  //   },
  // },
  chainWebpack: (config) => {
    // 修复 HMR
    // config.resolve.symlinks(true)
    // 添加别名
    config.resolve.alias.set('@', resolve('src'))
    //   .set('assets', resolve('src/assets'))
    //   .set('components', resolve('src/components'))
    //   .set('layout', resolve('src/layout'))
    //   .set('base', resolve('src/base'))
    //   .set('static', resolve('static'))
    // 打包分析
    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static',
        },
      ])
    }
    // 配置externals
    config.externals = {
      vue: 'Vue',
      'element-ui': 'ELEMENT',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      axios: 'axios',
    }
    // 生产环境
    if (IS_PROD) {
      const plugins = []
      // 公共代码抽离
      config.optimization = {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            parallel: true, // 使用多进程并行运行来提高构建速度, 默认并发运行数： os.cpu
            sourceMap: false,
            terserOptions: {
              warnings: false,
              compress: {
                drop_console: true, // 生产环境自动删除 console
                drop_debugger: true, // 生产环境自动删除 debugger
                pure_funcs: ['console.log'], // 移除 console
              },
            },
          }),
        ],
      }
      plugins.push(
        // 开启gzip压缩
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8,
        })
      )
      config.plugins = [...config.plugins, ...plugins]
    }
  },
  // 为 sass 提供全局样式，以及全局变量
  css: {
    modules: false,
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      sass: {
        // 向全局sass样式传入共享的全局变量
        data: `@import "~assets/scss/variables.scss";$src: "${process.env.VUE_APP_SRC}";`,
      },
    },
  },
}
