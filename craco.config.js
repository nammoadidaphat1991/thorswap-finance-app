module.exports = {
  plugins: [
    {
      plugin: {
        overrideWebpackConfig: ({ webpackConfig }) => {
          const minimizerIndex = webpackConfig.optimization.minimizer.findIndex(
            (item) => item.options.terserOptions,
          )

          // do not mangle problematic modules of bitcoinjs-lib
          webpackConfig.optimization.minimizer[
            minimizerIndex
          ].options.terserOptions.mangle = {
            ...webpackConfig.optimization.minimizer[minimizerIndex].options
              .terserOptions.mangle,
            reserved: ['BigInteger', 'ECPair', 'Point'],
          }

          return webpackConfig
        },
      },
    },
  ],
}
