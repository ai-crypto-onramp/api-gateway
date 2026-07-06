import { build } from 'esbuild';

const result = await build({
  entryPoints: ['dist/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.bundle.js',
  sourcemap: true,
  banner: { js: '// api-gateway production bundle' },
});

if (result.errors.length > 0) {
  console.error(result.errors);
  process.exit(1);
}
console.log('esbuild bundle -> dist/index.bundle.js');
