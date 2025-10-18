import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    retry: 3,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude:[
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
        'middleware/**',
        'services/**',
        '**/auth.js',
        '**/PlanitProxy.js',
        '**/Events.js',
      ],
    },
    include: ['**/*.test.js', '**/*.spec.js'],
  },
});