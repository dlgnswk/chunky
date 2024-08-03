module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: [
    'airbnb',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', '*.spec.jsx'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'module',
      },
    },
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'prettier', 'react-hooks'],
  rules: {
    semi: 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'no-unused-vars': 'warn',
    'import/no-extraneous-dependencies': 'off',
    'react/prop-types': 'off',
    'react/button-has-type': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/jsx-no-bind': 'off',
    'react/self-closing-comp': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/require-default-props': 'warn',
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx'] }],
    'no-param-reassign': 0,
    'global-require': 0,
    'no-underscore-dangle': 'off',
    'prettier/prettier': ['warn', { singleQuote: true }],
    'react/no-unknown-property': [
      'error',
      { ignore: ['geometry', 'intensity', 'position'] },
    ],
    'react/no-unknown-property': [
      'error',
      {
        ignore: [
          'attach',
          'object',
          'rotation',
          'transparent',
          'side',
          'attachObject',
          'count',
          'array',
          'itemSize',
          'args',
          'position',
          'intensity',
          'castShadow',
          'lookAt',
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
