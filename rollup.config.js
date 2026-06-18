import fs from 'fs';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License
 */
`;

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/baremetal.js',
      format: 'es',
      banner
    },
    {
      file: 'dist/baremetal.min.js',
      format: 'es',
      plugins: [terser()],
      banner
    }
  ]
};
