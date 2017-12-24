/**
 * Created by marcogobbi on 07/05/2017.
 */
import resolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-html';
export default {
    input: 'js/src/index.js',
    output: {
        format: 'iife',
        file: 'js/index.js'
    },

    exports: 'named',
    name: 'atw'
    , plugins: [
        resolve()
        ,html({
            include: '**/*.{css,html}'
        })
    ]
};