module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.BABEL_ENV === 'es' ? false : 'commonjs',
        forceAllTransforms: process.env.NODE_ENV === 'production'
      }
    ],
    '@babel/react',
    '@babel/stage-1'
  ]
};
