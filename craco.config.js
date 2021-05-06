// this config is intended to fix BCH transfer issues due to minifying JS after build
// https://github.com/gsoft-inc/craco/issues/44#issuecomment-573554956
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
