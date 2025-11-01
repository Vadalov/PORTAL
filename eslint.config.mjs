import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  
  // Custom rules
  {
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      
      // Console rules (allow warn/error, disallow log in production)
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],
      
      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'warn',
    },
  },
  
  // Test files için özel kurallar
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      // Test dosyalarında console.log'a izin ver
      'no-console': 'off',
      // Test dosyalarında any kullanımına daha toleranslı ol (ama yine de warn)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // Scripts and tools için özel kurallar
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js', 'scripts/**/*.mts', 'src/scripts/**/*.ts', 'src/scripts/**/*.js'],
    rules: {
      // Scripts'te console kullanımına izin ver (debugging/diagnostic scripts)
      'no-console': 'off',
      // Scripts'te any kullanımına daha toleranslı ol
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused vars için daha toleranslı ol
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  
  // Override default ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    '.husky/**',
    'coverage/**',
    'dist/**',
  ]),
]);

export default eslintConfig;
