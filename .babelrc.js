module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['ie >= 11']
        },
        modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
        loose: true
      }
    ],
    '@babel/preset-react'
  ],
  plugins: ['@babel/plugin-proposal-object-rest-spread']
};
