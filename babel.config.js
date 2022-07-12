module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: '.',
          alias: {
            '@src': './src',
            '@components': './src/components',
            '@atoms': './src/components/ui/atoms',
            '@molecules': './src/components/ui/molecules',
            '@organisms': './src/components/ui/organisms',
            '@screens': './src/screens',
            '@styles': './src/styles',
            '@utils': './src/utils',
            '@services': './src/services',
            '@assets': './assets'
          }
        }
      ]
    ]
  };
};
