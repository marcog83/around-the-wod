/**
 * Created by marcogobbi on 07/05/2017.
 */
import resolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-html';
import commonjs from 'rollup-plugin-commonjs';
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
        ,commonjs()
        ,html({
            include: '**/*.{css,html}'
        })
    ]
};