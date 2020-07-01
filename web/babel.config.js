const plugins = []

module.exports = {
  presets: [
    [
      '@vue/app',
      {
        polyfills: ['es.promise', 'es.symbol'],
      },
    ],
    '@vue/cli-plugin-babel/preset',
  ],
  plugins: plugins,
}
