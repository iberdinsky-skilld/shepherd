import babel from 'rollup-plugin-babel';
import browsersync from 'rollup-plugin-browsersync';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import filesize from 'rollup-plugin-filesize';
import license from 'rollup-plugin-license';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

const pkg = require('./package.json');
const banner = ['/*!', pkg.name, pkg.version, '*/\n'].join(' ');

const env = process.env.DEVELOPMENT ? 'development' : 'production';

const plugins = [
  resolve({
    extensions: ['.js', '.jsx', '.json' ]
  }),
  commonjs(),
  eslint(),
  babel({
    exclude: /node_modules\/(?!(nano-css)\/).*/
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify(env)
  })
];

// If we are running with --environment DEVELOPMENT, serve via browsersync for local development
if (process.env.DEVELOPMENT) {
  plugins.push(
    browsersync({
      host: 'localhost',
      watch: true,
      port: 3000,
      notify: false,
      open: true,
      server: {
        baseDir: 'demo',
        routes: {
          '/dist/js/shepherd.js': 'dist/js/shepherd.js',
          '/demo/js/prism.js': 'demo/js/prism.js',
          '/demo/js/welcome.js': 'demo/js/welcome.js',
          '/demo/css/prism.css': 'demo/css/prism.css',
          '/demo/css/welcome.css': 'demo/css/welcome.css',
          '/demo/sheep.svg': 'demo/sheep.svg'
        }
      }
    })
  );
}

plugins.push(license({ banner }));
plugins.push(filesize());
plugins.push(visualizer());

const rollupBuilds = [
  // Generate unminifed bundle
  {
    input: './src/js/shepherd.js',
    external: ['tippy.js'],
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: 'Shepherd',
        sourcemap: true,
        globals: {
          'tippy.js': 'tippy'
        }
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        globals: {
          'tippy.js': 'tippy'
        }
      }
    ],
    plugins
  }
];

if (!process.env.DEVELOPMENT) {
  rollupBuilds.push(
    // Generate minifed bundle
    {
      input: './src/js/shepherd.js',
      external: ['tippy.js', 'popper.js'],
      output: [
        {
          file: 'dist/js/shepherd.min.js',
          format: 'umd',
          name: 'Shepherd',
          sourcemap: true,
          globals: {
            'tippy.js': 'tippy'
          }
        },
        {
          file: 'dist/js/shepherd.esm.min.js',
          format: 'esm',
          sourcemap: true,
          globals: {
            'tippy.js': 'tippy'
          }
        }
      ],
      plugins: [
        resolve({
          extensions: ['.js', '.jsx', '.json' ]
        }),
        commonjs(),
        babel({
          exclude: /node_modules\/(?!(nano-css)\/).*/
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify(env)
        }),
        terser(),
        license({
          banner
        }),
        filesize(),
        visualizer()
      ]
    });
}

export default rollupBuilds;
