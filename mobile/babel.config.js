module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/lib': './src/lib',
            '@/hooks': './src/hooks',
            '@/stores': './src/stores',
            '@/types': './src/types',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
