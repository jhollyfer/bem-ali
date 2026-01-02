import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'application/**/*.ts',
    'bin/**/*.ts',
    'config/**/*.ts',
    'start/**/*.ts',

    //
    'database/**/*.ts',
  ],
  ignoreWatch: ['node_modules'],
  outDir: 'build',
  target: 'es2024',
  format: ['esm'],
});
