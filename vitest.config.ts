import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'playground/**/*'],
    testTimeout: 60000,
    coverage: {
      include: ['src/**/*'],
    },
  },
});
