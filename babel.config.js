module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      /**
       * We need the optional require plugin for react-native-paper Icon component
       * https://callstack.github.io/react-native-paper/icons.html
       */
      [
        'optional-require',
        {
          blacklist: 'react-native-vector-icons',
        },
      ],
    ],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
