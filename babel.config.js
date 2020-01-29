/*
 * @Descripttion:
 * @Author: voanit
 * @Date: 2020-01-26 20:25:16
 * @LastEditors: voanit
 * @LastEditTime: 2020-01-27 18:42:11
 */
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
}
