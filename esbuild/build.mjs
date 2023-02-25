import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

build({
    entryPoints: [
        'src/donkey_map_admin.js',
        'src/donkey_map_site.js'
    ],
    bundle: true,
    sourcemap: true,
    // minify: true,
    outdir: 'dist',
    loader: {
        '.png': 'copy'
    },
    plugins: [
        copy({
            verbose: true,
            assets: {
                from: [
                    './dist/donkey_map_admin.js',
                    './dist/donkey_map_admin.js.map'
                ],
                to: [
                    '../../modules/mod_donkey_map/media/mod_donkey_map/js'
                ],
            },
        }),
        copy({
            verbose: true,
            assets: {
                from: [
                    './dist/donkey_map_admin.css',
                    './dist/donkey_map_admin.css.map',
                ],
                to: [
                    '../../modules/mod_donkey_map/media/mod_donkey_map/css'
                ],
            },
        }),
        copy({
            verbose: true,
            assets: {
                from: [
                    './dist/donkey_map_site.js',
                    './dist/donkey_map_site.js.map',
                ],
                to: [
                    '../../modules/mod_donkey_map/media/mod_donkey_map/js'
                ],
            },
        }),
        copy({
            verbose: true,
            assets: {
                from: [
                    './dist/donkey_map_site.css',
                    './dist/donkey_map_site.css.map',
                    './dist/*.png',
                ],
                to: [
                    '../../modules/mod_donkey_map/media/mod_donkey_map/css'
                ],
            },
        })
    ]
}).catch(() => process.exit(1));