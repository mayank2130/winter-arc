import { nextConfig } from '@next/eslint-config-next'

export default [
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off'
    }
  }
]
