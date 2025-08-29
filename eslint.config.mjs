// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const baseConfig = tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn'
    },
  },
);

function downgradeRules(rules) {
  const downgraded = {};
  for (const [key, value] of Object.entries(rules)) {
    if (value === 'error') {
      downgraded[key] = 'warn';
    } else if (Array.isArray(value) && value[0] === 'error') {
      downgraded[key] = ['warn', ...value.slice(1)];
    } else {
      downgraded[key] = value;
    }
  }
  return downgraded;
}

export default baseConfig.map((config) =>
  config.rules
    ? { ...config, rules: downgradeRules(config.rules) }
    : config
);