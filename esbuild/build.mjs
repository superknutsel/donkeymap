import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

build({
    entryPoints: [
        'src/donkey_map_admin.js'
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
        })
    ]
}).catch(() => process.exit(1));