/*
 * @Descripttion:
 * @Author: yanxu gong
 * @Date: 2020-02-21 11:26:15
 * @LastEditors: yanxu gong
 * @LastEditTime: 2020-02-21 14:57:59
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
