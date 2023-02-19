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
                    './dist/donkey_map_site.js',
                    './dist/donkey_map_site.js.map'
                ],
                to: [
                    '../../modules/mod_donkey_map/media/mod_donkey_map/js'
                ],
            },
        })
    ]
}).catch(() => process.exit(1));